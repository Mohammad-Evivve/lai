const fs = require('fs');
const path = 'src/pages/Part1Report.jsx';
let content = fs.readFileSync(path, 'utf8');

const anchor = '<Link to="/how-measured" className="btn-institutional primary">Begin Behavioral Observation</Link>';
const insertion = `
                    <button 
                      className="btn-institutional outline premium-share-btn no-print"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        setCopied('report_footer');
                        setTimeout(() => setCopied(null), 2000);
                      }}
                    >
                      {copied === 'report_footer' ? <><CheckCircle2 size={16} /> URL Copied</> : <><LinkIcon size={16} /> Copy Report Link</>}
                    </button>`;

if (content.includes(anchor)) {
    content = content.replace(anchor, anchor + insertion);
    fs.writeFileSync(path, content);
    console.log('Successfully inserted button');
} else {
    console.log('Anchor not found');
}
