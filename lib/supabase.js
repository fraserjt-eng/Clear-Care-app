import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database helper functions
export async function saveConversation(data) {
  const { data: conversation, error } = await supabase
    .from('conversations')
    .insert({
      title: data.title,
      person_name: data.personName,
      conversation_type: data.type,
      relationship_context: data.relationship,
      warmth_level: data.warmth,
      structure_level: data.structure,
      care_c: data.care?.C,
      care_a: data.care?.A,
      care_r: data.care?.R,
      care_e: data.care?.E,
      clear_c: data.clear?.C,
      clear_l: data.clear?.L,
      clear_e: data.clear?.E,
      clear_a: data.clear?.A,
      clear_r: data.clear?.R,
      conversation_starter: data.starter,
      additional_notes: data.notes,
      status: data.status || 'prepared'
    })
    .select()
    .single()
    
  if (error) {
    console.error('Error saving conversation:', error)
    return null
  }
  return conversation
}

export async function updateConversation(id, updates) {
  const { data, error } = await supabase
    .from('conversations')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
    
  if (error) {
    console.error('Error updating conversation:', error)
    return null
  }
  return data
}

export async function getConversations() {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error('Error fetching conversations:', error)
    return []
  }
  return data
}

export async function getConversation(id) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .single()
    
  if (error) {
    console.error('Error fetching conversation:', error)
    return null
  }
  return data
}
