// Utility functions for handling @mentions in posts and comments

/**
 * Extract @mentions from text
 * Returns array of usernames (without @)
 */
export const extractMentions = (text: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const matches = text.matchAll(mentionRegex);
  const mentions = Array.from(matches, match => match[1]);
  return [...new Set(mentions)]; // Remove duplicates
};

/**
 * Highlight @mentions in text for display
 * Returns text with mentions wrapped in special markers
 */
export const highlightMentions = (text: string): string => {
  return text.replace(/@(\w+)/g, '[@$1]');
};

/**
 * Parse text with highlighted mentions into components
 * Returns array of text segments with mention flags
 */
export interface TextSegment {
  text: string;
  isMention: boolean;
  username?: string;
}

export const parseTextWithMentions = (text: string): TextSegment[] => {
  const segments: TextSegment[] = [];
  const mentionRegex = /@(\w+)/g;
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, match.index),
        isMention: false,
      });
    }

    // Add mention
    segments.push({
      text: `@${match[1]}`,
      isMention: true,
      username: match[1],
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      isMention: false,
    });
  }

  return segments;
};

/**
 * Validate if a username exists
 */
export const validateUsername = async (
  username: string,
  supabase: any
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    return !error && !!data;
  } catch {
    return false;
  }
};

/**
 * Search for users by username (for autocomplete)
 */
export const searchUsers = async (
  query: string,
  supabase: any,
  limit: number = 5
): Promise<Array<{ username: string; display_name: string | null }>> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, display_name')
      .ilike('username', `${query}%`)
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};
