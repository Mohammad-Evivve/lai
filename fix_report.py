import os

path = 'src/pages/Part1Report.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

anchor = '<button className="btn-institutional outline" onClick={() => window.print()}>Download Perception Brief</button>'
insertion = """<button 
                      className="btn-institutional outline premium-share-btn no-print"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        setCopied('report_footer');
                        setTimeout(() => setCopied(null), 2000);
                      }}
                    >
                      {copied === 'report_footer' ? <><CheckCircle2 size={16} /> URL Copied</> : <><LinkIcon size={16} /> Copy Report Link</>}
                    </button>
                    """

if anchor in content:
    content = content.replace(anchor, insertion + anchor)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully inserted button")
else:
    print("Anchor not found")
