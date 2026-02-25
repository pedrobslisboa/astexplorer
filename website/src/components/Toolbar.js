import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import CategoryButton from './buttons/CategoryButton';
import SnippetButton from './buttons/SnippetButton';
import KeyMapButton from './buttons/KeyMapButton';
import ThemeButton from './buttons/ThemeButton';
import {
  save,
  selectCategory,
  openSettingsDialog,
  openShareDialog,
  setParser,
  reset,
  setKeyMap,
  setTheme,
} from '../store/actions';
import * as selectors from '../store/selectors';

export default function Toolbar() {
  const dispatch = useDispatch();
  const parser = useSelector(selectors.getParser);
  const forking = useSelector(selectors.isForking);
  const saving = useSelector(selectors.isSaving);
  const canSaveVal = useSelector(selectors.canSave);
  const canForkVal = useSelector(selectors.canFork);
  const keyMap = useSelector(selectors.getKeyMap);
  const snippet = useSelector(selectors.getRevision);
  const theme = useSelector(selectors.getTheme);

  const props = {
    forking,
    saving,
    canSave: canSaveVal,
    canFork: canForkVal,
    category: parser.category,
    parser,
    keyMap,
    snippet,
    onParserChange: p => dispatch(setParser(p)),
    onCategoryChange: category => dispatch(selectCategory(category)),
    onParserSettingsButtonClick: () => dispatch(openSettingsDialog()),
    onShareButtonClick: () => dispatch(openShareDialog()),
    onKeyMapChange: km => dispatch(setKeyMap(km)),
    onSave: () => dispatch(save(false)),
    onFork: () => dispatch(save(true)),
    onNew: () => {
      if (global.location.hash) {
        global.location.hash = '';
      } else {
        dispatch(reset());
      }
    },
  };

  return (
    <div id="Toolbar">
      <h1>OCaml AST explorer</h1>
      <SnippetButton {...props} />
      <CategoryButton {...props} />
      <KeyMapButton {...props} />
      <ThemeButton theme={theme} onThemeChange={t => dispatch(setTheme(t))} />
      <a
        style={{minWidth: 0}}
        target="_blank" rel="noopener noreferrer"
        title="Help"
        href="https://github.com/pedrolisboa/ocaml-ast-explorer/blob/master/README.md">
        <i className="fa fa-lg fa-question fa-fw" />
      </a>
      <div id="info">
        Ppxlib AST version: <a href="https://github.com/ocaml-ppx/ppxlib/releases/tag/0.37.0" target="_blank" rel="noopener noreferrer">3.7.0</a>
      </div>
    </div>
  );
}
