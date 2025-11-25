export async function POST(request) {
  const body = await request.json()
  
  const systemPrompt = `You are an expert communication coach helping educators prepare for difficult conversations. Generate warm, professional conversation openers that balance care with clarity.

The Clear & Care framework:
- CARE (Warmth): Connection, Acknowledge, Respect, Empathy
- CLEAR (Structure): Context, Listen First, Expectations, Agreements, Revisit

Generate openers that:
1. Start with genuine care and connection
2. Create psychological safety
3. Invite dialogue before making statements
4. Are appropriate for educational settings`

  const userPrompt = `Generate a conversation opener for:

Type: ${body.conversationType || 'general'}
Person: ${body.personName || 'colleague'}
Relationship: ${body.relationship || 'professional'}
Warmth Level: ${body.warmth || 70}/100
Structure Level: ${body.structure || 70}/100

CARE Preparation:
- Connection: ${body.care?.C || 'Build rapport'}
- Acknowledge: ${body.care?.A || 'Validate experience'}
- Respect: ${body.care?.R || 'Assume positive intent'}
- Empathy: ${body.care?.E || 'Name emotions'}

Generate 2-3 sentences to open this conversation. Lead with care, create space for them to share. Respond with ONLY the opener.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    })

    const data = await response.json()
    
    if (data.content && data.content[0]) {
      return Response.json({ starter: data.content[0].text })
    } else {
      throw new Error('Invalid response from Claude')
    }
  } catch (error) {
    console.error('Claude API error:', error)
    // Fallback response
    return Response.json({ 
      starter: "I appreciate you taking the time to meet with me today. Before I share what I've noticed, I'd really like to understand how things have been going from your perspective. How are you feeling about things lately?"
    })
  }
}
