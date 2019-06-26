import React from "react";
import PropTypes from "prop-types";

const props = size => ({
  viewBox: "0 0 24 24",
  style: {
    display: "inline-block",
    fill: "currentColor",
    height: size,
    stroke: "currentColor",
    strokeWidth: 0,
    width: size
  }
});

export const Close = ({ size = 32 }) => (
  <svg {...props(size)}>
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

export const Edit = ({ size = 32 }) => (
  <svg {...props(size)}>
    <path d="M5.5 16.5837V19.5h2.9163l8.6-8.6L14.1 7.9827zm13.7725-7.94c.3033-.3033.3033-.7932 0-1.0965l-1.8197-1.8197c-.3033-.3033-.7932-.3033-1.0965 0l-1.4232 1.423 2.9163 2.9163z"/>
  </svg>
);

export const FullscreenEnter = ({ size = 32 }) => (
  <svg {...props(size)}>
    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
  </svg>
);

export const FullscreenExit = ({ size = 32 }) => (
  <svg {...props(size)}>
    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
  </svg>
);

Close.propTypes = { size: PropTypes.number };
Edit.propTypes = { size: PropTypes.number };
FullscreenEnter.propTypes = { size: PropTypes.number };
FullscreenExit.propTypes = { size: PropTypes.number };
