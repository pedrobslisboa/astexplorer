import PropTypes from 'prop-types';
import React from 'react';
import cx from '../../utils/classnames.js';

const themes = ['auto', 'light', 'dark'];
const THEME_ICON = {auto: 'fa-circle-o', light: 'fa-sun-o', dark: 'fa-moon-o'};
const THEME_LABEL = {auto: 'Auto', light: 'Light', dark: 'Dark'};

export default function ThemeButton({theme, onThemeChange}) {
  return (
    <div className={cx({button: true, menuButton: true})}>
      <button type="button">
        <i className={cx({'fa': true, 'fa-lg': true, [THEME_ICON[theme]]: true, 'fa-fw': true})} />
        &nbsp;{THEME_LABEL[theme]}
      </button>
      <ul>
        {themes.map(t => (
          <li
            key={t}
            disabled={theme === t}
            onClick={() => onThemeChange(t)}>
            <button type="button">
              <i className={cx({'fa': true, 'fa-fw': true, [THEME_ICON[t]]: true})} />
              &nbsp;{THEME_LABEL[t]}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

ThemeButton.propTypes = {
  theme: PropTypes.string,
  onThemeChange: PropTypes.func,
};
