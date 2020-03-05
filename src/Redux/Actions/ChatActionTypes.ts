const NAMESPACE = 'CHAT';

const ChatActionTypes = {
  SET_CURRENT_USERNAME: `${NAMESPACE}_SET_CURRENT_USERNAME`,
  SET_SIGN_IN_ERRORS: `${NAMESPACE}_SET_SIGN_IN_ERRORS`,
  SELECT_TARGET_USER: `${NAMESPACE}_SELECT_TARGET_USER`,
  RESET_CHAT: `${NAMESPACE}_RESET_CHAT`,
  UPDATE_ACTIVE_USERS: `${NAMESPACE}_UPDATE_ACTIVE_USERS`,
};

export { ChatActionTypes };
