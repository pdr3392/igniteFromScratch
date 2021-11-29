import React, { useEffect } from 'react';

const addUtterancesScript = (
  parentElement,
  repo,
  label,
  issueTerm,
  theme,
  isIssueNumber
) => {
  const scriptElem = document.createElement('script');
  scriptElem.src = 'https://utteranc.es/client.js';
  scriptElem.async = true;
  scriptElem.crossOrigin = 'anonymous';
  scriptElem.setAttribute('repo', 'pdr3392/igniteFromScratch');

  if (label !== '') {
    scriptElem.setAttribute('label', label);
  }

  if (isIssueNumber) {
    scriptElem.setAttribute('issue-number', issueTerm);
  } else {
    scriptElem.setAttribute('issue-term', issueTerm);
  }

  scriptElem.setAttribute('theme', theme);

  parentElement.appendChild(scriptElem);
};

const Comments = () => {
  const repo = 'igniteFromScratch';
  const theme = 'photon-dark';
  const issueTerm = 'pathname';
  const label = 'blog-comment';

  useEffect(() => {
    // Get comments box
    const commentsBox = document.getElementById('commentsBox');

    // Check if comments box is loaded
    if (!commentsBox) {
      return;
    }

    // Get utterances
    const utterances = document.getElementsByClassName('utterances')[0];

    // Remove utterances if it exists
    if (utterances) {
      utterances.remove();
    }

    // Add utterances script
    addUtterancesScript(commentsBox, repo, label, issueTerm, theme, false);
  });

  return <div id="commentsBox" />;
};

export default Comments;
