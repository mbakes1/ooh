import { useQuery } from "@tanstack/react-query";

interface SentMessage {
  id: string;
  content: string;
  createdAt: string;
  conversation: {
    id: string;
    billboard?: {
      title: string;
    };
    participants: Array<{
      id: string;
      name: string;
    }>;
  };
}

const SENT_MESSAGES_KEY = ["messages", "sent"] as const;

export function useSentMessages() {
  return useQuery({
    queryKey: SENT_MESSAGES_KEY,
    queryFn: async (): Promise<SentMessage[]> => {
      const response = await fetch("/api/messages/sent");
      if (!response.ok) {
        throw new Error("Failed to fetch sent messages");
      }
      const data = await response.json();
      return data.messages || [];
    },
  });
}