interface TableAnalysisInput {
  highlights: Array<{
    text: string
    color: string
  }>
  tableData: {
    type: string
    attrs: {
      id: string
      name: string
      refs: any[]
    }
    content: Array<{
      type: string
      attrs: { id: string }
      content: Array<{
        type: string
        attrs: { id: string }
        content: any
      }>
    }>
  } | null
}

interface ColorSuggestion {
  cellId: string
  color: string
  confidence: number
  matchedText: string
}

interface AIResponse {
  suggestions: ColorSuggestion[]
  explanation: string
}

function getOpenAIKey(): string {
  console.log('Environment variables:', {
    direct: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    window: typeof window !== 'undefined' ? window.ENV_OPENAI_API_KEY : undefined,
  })

  const key =
    process.env.NEXT_PUBLIC_OPENAI_API_KEY || (typeof window !== 'undefined' ? window.ENV_OPENAI_API_KEY : undefined)

  if (!key || key.length === 0) {
    throw new Error('OpenAI API key is not configured. Please check your environment variables.')
  }
  return key
}

async function generateAIResponse(analysisInput: TableAnalysisInput): Promise<AIResponse> {
  try {
    const apiKey = getOpenAIKey()
    console.log('API Key available:', !!apiKey)

    // Log the input being sent to OpenAI
    console.log('=== Input to OpenAI API ===')
    console.log('Highlights:', analysisInput.highlights)
    console.log('Table Structure:', JSON.stringify(analysisInput.tableData, null, 2))

    const systemInstructions = `
    You are an AI assistant that analyzes table content and highlighted text to suggest color mappings.
    
    Task: Analyze the provided table cells and highlighted text to suggest which table cells should be colored
    based on their semantic relationship with the highlighted text.

    Rules:
    - Only suggest colors that were used in the original highlights
    - Assign higher confidence scores (0-1) for stronger semantic matches
    - Consider both exact matches and semantic similarities
    - If a cell's content doesn't relate to any highlights, don't include it
    
    Return a JSON response with:
    - suggestions: Array of color suggestions for specific cells
    - explanation: Brief explanation of the mapping logic

    Important: Return only the JSON object without any markdown formatting or code blocks.
  `

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemInstructions },
          {
            role: 'user',
            content: JSON.stringify({
              highlights: analysisInput.highlights,
              tableStructure: analysisInput.tableData,
            }),
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const data = await response.json()

    // Log the raw API response
    console.log('=== Raw OpenAI API Response ===')
    console.log(JSON.stringify(data, null, 2))

    // Extract the content and clean any potential markdown formatting
    let contentString = data.choices[0].message.content.trim()

    // Log the content string before cleaning
    console.log('=== Content String Before Cleaning ===')
    console.log(contentString)

    // Remove markdown code block if present
    if (contentString.startsWith('```json')) {
      contentString = contentString.replace(/^```json\n/, '').replace(/\n```$/, '')
    } else if (contentString.startsWith('```')) {
      contentString = contentString.replace(/^```\n/, '').replace(/\n```$/, '')
    }

    // Log the cleaned content string
    console.log('=== Content String After Cleaning ===')
    console.log(contentString)

    const aiResponse = JSON.parse(contentString) as AIResponse

    // Log the final parsed response
    console.log('=== Final Parsed Response ===')
    console.log(JSON.stringify(aiResponse, null, 2))

    // Validate and clean the response
    return {
      suggestions: aiResponse.suggestions.map(suggestion => ({
        cellId: suggestion.cellId,
        color: suggestion.color,
        confidence: Math.max(0, Math.min(1, suggestion.confidence)),
        matchedText: suggestion.matchedText,
      })),
      explanation: aiResponse.explanation,
    }
  } catch (error) {
    console.error('Error in AI analysis:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to analyze table and highlights: ${error.message}`)
    }
    throw error
  }
}

// Helper function to process the button click data
export async function analyzeTableAndHighlights(
  highlights: Array<{ text: string; color: string }>,
  tableData: any
): Promise<AIResponse> {
  try {
    const analysis = await generateAIResponse({
      highlights,
      tableData,
    })

    console.log('AI Analysis Results:', analysis)
    return analysis
  } catch (error) {
    console.error('Analysis failed:', error)
    throw error
  }
}
