import {
  SHOW_SIDEBAR,
  HIDE_SIDEBAR,
  SHOW_SIDEBAR_MENU,
  HIDE_SIDEBAR_MENU,
  EXPAND_SIDE_MENU,
  REDUCE_SIDE_MENU
} from "../actions/SidebarActions";
import { QUIT_WALLET } from "actions/DaemonActions";

export default function sidebar(state = {}, action) {
  switch (action.type) {
    case EXPAND_SIDE_MENU:
      return {
        ...state,
        expandSideBar: true
      };
    case REDUCE_SIDE_MENU:
      return {
        ...state,
        expandSideBar: false
      };
    case HIDE_SIDEBAR:
      return {
        ...state,
        showingSidebar: false
      };
    case SHOW_SIDEBAR:
      return {
        ...state,
        showingSidebar: true
      };
    case HIDE_SIDEBAR_MENU:
      return {
        ...state,
        showingSidebarMenu: false
      };
    case SHOW_SIDEBAR_MENU:
      return {
        ...state,
        showingSidebarMenu: true
      };
    case QUIT_WALLET:
      return {
        ...state,
        showingSidebar: true,
        showingSidebarMenu: false,
        expandSideBar: true
      };
    default:
      return state;
  }
}
