
export interface WebsocketChat {
  action: string,
  content?: string,
  type?: string,
  history?: WebsocketChat[],
  author?: string,
  messageId?: string,
  timestamp?: number,
  text?: string,
  welcomeMessageInfo?: WelcomeMessageInfo,
  displayHint?: string,
  title?: string,
  items?: MenuItems[],
  postback?: string,
  postbackMessageId?: string,
  read?: boolean,
  messageStatus?: string,
  disabled?: boolean,
  label?: string,
  url?: string
}

export interface WelcomeMessageInfo {
  triggered: boolean,
  received?: boolean
}

export interface MenuItems {
  payload: string,
  text: string
}
