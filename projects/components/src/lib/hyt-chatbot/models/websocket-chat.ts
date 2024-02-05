
export interface WebsocketChat {
  action?: string,
  content?: string,
  type?: string,
  author?: string,
  messageId?: string,
  timestamp?: number,
  text?: string,
  read?: boolean,
  messageStatus?: string
}