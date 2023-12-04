import {PageTags} from "./page-tags";

export interface WebsocketChat {
  action: string,
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
  pageTags?: PageTags,
  messageIds?: string[],
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
