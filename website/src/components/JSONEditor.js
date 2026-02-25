import CodeMirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/theme/material-darker.css';
import PropTypes from 'prop-types';
import {subscribe, clear} from '../utils/pubsub.js';
import React, {useRef, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {getTheme} from '../store/selectors';

const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

function resolveEditorTheme(theme) {
  const isDark = theme === 'dark' || (theme === 'auto' && darkMediaQuery.matches);
  return isDark ? 'material-darker' : 'default';
}

export default function JSONEditor({value, className}) {
  const theme = useSelector(getTheme);
  const editorTheme = resolveEditorTheme(theme);

  const containerRef = useRef(null);
  const cmRef = useRef(null);
  const prevValueRef = useRef(value);
  const prevThemeRef = useRef(editorTheme);

  // Mount CodeMirror
  useEffect(() => {
    const subscriptions = [];
    const cm = CodeMirror(containerRef.current, { // eslint-disable-line new-cap
      value: value || '',
      mode: {name: 'javascript', json: true},
      theme: editorTheme,
      readOnly: true,
      lineNumbers: true,
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
    });
    cmRef.current = cm;

    subscriptions.push(
      subscribe('PANEL_RESIZE', () => {
        if (cmRef.current) cmRef.current.refresh();
      }),
    );

    return () => {
      clear(subscriptions);
      const container = containerRef.current;
      if (container && container.children[0]) {
        container.removeChild(container.children[0]);
      }
      cmRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync value changes
  useEffect(() => {
    const cm = cmRef.current;
    if (!cm || value === prevValueRef.current) return;
    prevValueRef.current = value;
    const info = cm.getScrollInfo();
    cm.setValue(value);
    cm.scrollTo(info.left, info.top);
  }, [value]);

  // Sync theme changes
  useEffect(() => {
    const cm = cmRef.current;
    if (!cm) return;
    if (editorTheme !== prevThemeRef.current) {
      prevThemeRef.current = editorTheme;
      cm.setOption('theme', editorTheme);
    }
  }, [editorTheme]);

  return <div id="JSONEditor" className={className} ref={containerRef} />;
}

JSONEditor.propTypes = {
  value: PropTypes.string,
  className: PropTypes.string,
};
