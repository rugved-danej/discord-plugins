function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        const btns = document.querySelectorAll('.copy-btn');
        btns.forEach(btn => {
            btn.textContent = 'Copied!';
            btn.style.background = 'var(--success)';
            btn.style.color = '#fff';
            
            setTimeout(() => {
                btn.textContent = 'Copy';
                btn.style.background = 'var(--border-glass)';
                btn.style.color = 'var(--text-main)';
            }, 2000);
        });
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}
