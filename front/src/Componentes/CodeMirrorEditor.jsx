import React, { useEffect, useRef, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { sql } from '@codemirror/lang-sql';
import { autocompletion } from '@codemirror/autocomplete';


const SQL_COMPLETIONS = [
  { label: 'SELECT', type: 'keyword' },
  { label: 'FROM', type: 'keyword' },
  { label: 'WHERE', type: 'keyword' },
  { label: 'INSERT INTO', type: 'keyword' },
];

function sqlLanguageData() {
  return {
    override: [
      (context) => {
        const token = context.matchBefore(/\w*/);
        if (!token || (token.from === token.to && !context.explicit)) return null;

        return {
          options: SQL_COMPLETIONS,
          from: token.from,
          to: token.to,
        };
      },
    ],
  };
}

const CodeMirrorEditor = React.memo(({ value, onChange }) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  const [Copia, SetCopia] = useState('')
  const SetterCopia = (event) => {
    SetCopia(event.target.value)
  }

  const handleChange = useCallback((update) => {
    if (update.changes) {
      onChange(update.state.doc.toString());
    }
  }, [onChange]);

  useEffect(() => {
    if (!editorRef.current) return;

    const startState = EditorState.create({
      doc: value || '-- Escribe tu SQL aquí',
      extensions: [
        basicSetup,
        sql(),
        autocompletion(sqlLanguageData()),
        EditorView.updateListener.of(handleChange),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [handleChange, value]);

  useEffect(() => {
    if (!viewRef.current) return;

    const currentValue = viewRef.current.state.doc.toString();
    if (value !== currentValue) {
      const transaction = viewRef.current.state.update({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value || '',
        },
      });
      viewRef.current.dispatch(transaction);
    }
  }, [value]);

  return <div ref={editorRef} className="border rounded p-2 h-64 overflow-auto font-mono text-sm" />;
});

export default CodeMirrorEditor;