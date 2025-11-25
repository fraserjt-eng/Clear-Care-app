const PERSONAS = {
  1: {
    name: 'Ms. Rodriguez',
    role: '3rd-year teacher',
    personality: 'Generally committed, currently overwhelmed',
    context: 'Dealing with childcare challenges since daycare hours changed',
    stance: 'Slightly defensive, embarrassed about the situation'
  },
  2: {
    name: 'Mr. Thompson',
    role: 'Parent of 7th grader',
    personality: 'Protective, feels unheard',
    context: 'Child has been struggling socially, grade feels like another failure',
    stance: 'Frustrated, ready to advocate for child'
  },
  3: {
    name: 'Mr. Chen',
    role: 'Veteran teacher (15 years)',
    personality: 'Enthusiastic, talkative, unaware of impact',
    context: 'Uses talking to process ideas, doesn\'t realize he\'s dominating',
    stance: 'Surprised, confused when confronted'
  },
  4: {
    name: 'Ms. Davis',
    role: 'New teacher (1st year)',
    personality: 'Eager to please, anxious',
    context: 'Was checking on a family emergency',
    stance: 'Worried about job security, embarrassed'
  },
  5: {
    name: 'Mr. Williams',
    role: 'Usually excellent employee (8 years)',
    personality: 'Private, struggles to ask for help',
    context: 'Going through difficult divorce, hasn\'t disclosed',
    stance: 'Trying to push through, defensive about personal life'
  }
}

export async function POST(request) {
  const { scenarioId, messages, userMessage } = await request.json()
  
  const persona = PERSONAS[scenarioId] || PERSONAS[1]
  
  const systemPrompt = `You are role-playing as ${persona.name}, ${persona.role}.

Character details:
- Personality: ${persona.personality}
- Hidden context (don't reveal unless asked directly): ${persona.context}
- Initial stance: ${persona.stance}

Guidelines:
1. Stay in character throughout
2. Show realistic emotions (defensiveness, confusion, openness)
3. Gradually become more receptive if the educator shows good CARE and CLEAR skills
4. If they're too aggressive, become more defensive
5. If they're too passive, remain disengaged
6. Respond to genuine empathy with increased openness
7. Keep responses conversational (2-4 sentences)

Do NOT break character or give feedback.`

  const conversationHistory = (messages || []).map(m => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.content
  }))
  
  conversationHistory.push({ role: 'user', content: userMessage })

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
        messages: conversationHistory
      })
    })

    const data = await response.json()
    
    if (data.content && data.content[0]) {
      return Response.json({ response: data.content[0].text })
    } else {
      throw new Error('Invalid response')
    }
  } catch (error) {
    console.error('Claude API error:', error)
    return Response.json({ 
      response: "I appreciate you taking the time to talk with me about this."
    })
  }
}
