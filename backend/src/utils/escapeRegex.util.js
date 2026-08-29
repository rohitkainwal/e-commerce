//! whatever the user types in the search box goes straight into a RegExp.
//? characters like * + ( [ have a special meaning there, so a string such as
//? "((((((a+)+)+)+" can make the regex engine hang and freeze the whole server.
//? escaping them turns every character back into a plain character.
export const escapeRegex = (text = "") =>
  String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default escapeRegex;
