import PropTypes from 'prop-types';
import React from 'react';
import { categories } from '../parsers';

const acceptedFileTypes = new Map([
  ['application/json', 'JSON'],
  ['text/plain', 'TEXT'],
]);

categories.forEach(({ id, mimeTypes }) => {
  mimeTypes.forEach(mimeType => {
    acceptedFileTypes.set(mimeType, id);
  });
});

export default class PasteDropTarget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dragging: false,
    };
  }

  componentDidMount() {
    this._listeners = [];
    let target = this.container;

    // Handle pastes
    this._bindListener(document, 'paste', event => {
      if (!event.clipboardData) {
        return;
      }
      let cbdata = event.clipboardData;
      if (!cbdata.types.indexOf || !cbdata.types.indexOf('text/plain') > -1) {
        return;
      }
      event.stopPropagation();
      event.preventDefault();
      const text = cbdata.getData('text/plain');
      this.props.onText('paste', event, text);
    }, true);

    let timer;

    // Handle file drops
    this._bindListener(target, 'dragenter', event => {
      clearTimeout(timer);
      event.preventDefault();
      this.setState({dragging: true});
    }, true);

    this._bindListener(target, 'dragover', event => {
      clearTimeout(timer);
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    }, true);

    this._bindListener(target, 'drop', event => {
      this.setState({dragging: false});
      let file = event.dataTransfer.files[0];
      let categoryId = acceptedFileTypes.get(file.type);
      if (!categoryId || !this.props.onText) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      let reader = new FileReader();
      reader.onload = readerEvent => {
        const text = readerEvent.target.result;
        this.props.onText('drop', readerEvent, text, categoryId !== 'JSON' && categoryId !== 'TEXT' ? categoryId : undefined);
      };
      reader.readAsText(file);
    }, true);

    this._bindListener(target, 'dragleave', () => {
      clearTimeout(timer);
      timer = setTimeout(() => this.setState({dragging: false}), 50);
    }, true);
  }

  componentWillUnmount() {
    for (const removeListener of this._listeners) {
      removeListener();
    }
    this._listeners = null;
  }

  _bindListener(elem, event, listener, capture) {
    for (const e of event.split(/\s+/)) {
      elem.addEventListener(e, listener, capture);
      this._listeners.push(
        () => elem.removeEventListener(e, listener, capture),
      );
    }
  }

  render() {
    let {children, onText: _onText, ...props} = this.props;
    const dropindicator = this.state.dragging ?
      <div className="dropIndicator">
        <div>Drop the code file here</div>
      </div> :
      null;

    return (
      <div
        ref={c => this.container = c}
        {...props}>
        {dropindicator}
        {children}
      </div>
    );
  }
}

PasteDropTarget.propTypes = {
  onText: PropTypes.func,
  onError: PropTypes.func,
  children: PropTypes.node,
};
