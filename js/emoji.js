/**
 * Updated: 2025-07-26
 * Author: ©彼岸临窗 oneblog.net
 *
 * 注释含命名规范，开源不易，如需引用请注明来源:彼岸临窗 https://oneblog.net。
 * 本主题已取得软件著作权（登记号：2025SR0334142）和外观设计专利（专利号：第7121519号），请严格遵循GPL-2.0协议使用本主题及源码。
 */
document.addEventListener('DOMContentLoaded', function() {
    var emojiBox = document.querySelector('.icon-emoji');
    if (!emojiBox) return; // 如果当前页面不存在表情按钮，则不执行该JS
    const richEditor = document.getElementById('rich-editor');
    const textarea = document.getElementById('textarea');
    const emojiBtn = document.getElementById('emoji-btn');
    const emojiPicker = document.getElementById('emoji-picker');
    const emojiContainer = document.querySelector('.emoji-container');
    const emojiCategories = document.querySelectorAll('.emoji-category');
    const emojiBaseUrl = '/usr/themes/OneBlog/static/img/emoji/';

    // 保存最近一次在编辑器内的selection
    let savedRange = null;

    function saveSelection() {
        const sel = window.getSelection();
        if (!sel.rangeCount) return;
        const range = sel.getRangeAt(0);
        // 只保存在编辑器内的range
        let node = range.commonAncestorContainer;
        while (node) {
            if (node === richEditor) {
                savedRange = range.cloneRange();
                return;
            }
            node = node.parentNode;
        }
    }
    function restoreSelection() {
        if (savedRange) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedRange);
            richEditor.focus();
        } else {
            // 没有保存，直接移到末尾
            moveCursorToEnd(richEditor);
        }
    }
    function moveCursorToEnd(element) {
        const range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        element.focus();
    }
    // 只要编辑器有操作就保存selection
    ['mouseup', 'keyup', 'selectionchange'].forEach(evt => {
        document.addEventListener(evt, function() {
            // 只在编辑器内操作时保存
            if (document.activeElement === richEditor) {
                saveSelection();
            }
        });
    });
    // 富文本输入时同步
    richEditor.addEventListener('input', function() {
        syncTextarea();
    });
    // 粘贴支持
    richEditor.addEventListener('paste', function(e) {
        e.preventDefault();
        let text = (e.clipboardData || window.clipboardData).getData('text');
        text = text.replace(/\[emoji:([a-zA-Z0-9_]+)\]/g, function(match, p1) {
            return `<img class="biaoqing" src="${emojiBaseUrl}${p1}.svg" alt="[emoji:${p1}]" data-emoji="${p1}">`;
        });
        document.execCommand('insertHTML', false, text);
        syncTextarea();
    });

    // 插入表情
    function insertEmojiImg(emojiName) {
        restoreSelection();
        let img = document.createElement('img');
        img.src = emojiBaseUrl + emojiName + '.svg';
        img.alt = `[emoji:${emojiName}]`;
        img.className = 'biaoqing';
        img.setAttribute('data-emoji', emojiName);

        insertNodeAtCursor(img);
        // 光标放到表情后
        placeCaretAfterNode(img);
        syncTextarea();
        // 重新保存selection
        saveSelection();
    }
    function insertNodeAtCursor(node) {
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            let range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(node);
        } else {
            richEditor.appendChild(node);
        }
    }
    function placeCaretAfterNode(node) {
        const range = document.createRange();
        range.setStartAfter(node);
        range.collapse(true);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        richEditor.focus();
    }
    function loadEmojis(category) {
        emojiContainer.innerHTML = '';
        const emojiData = {
            emotion: [
                '101','102','103','104','105','106','107',
                '108','109','110','111','112','113','114',
                '115','116','117','118','119','120','121',
                '122','123','124','125','126','127','128',
                '129','130','131','132','133','134',
            ],
            special: [
                '201','202','203','204','205','206','207',
                '208','209','210',
            ],
            kaomoji: [
                '(✪ω✪)','(*^▽^*)','٩(๑❛ᴗ❛๑)۶',
                '(๑´ㅂ`๑) ','(◕ᴗ◕✿)',
                '(๑¯∀¯๑)','(＾ω＾)','(★ᴗ★)',
                '(*^__^*) ','(╯︵╰)','(T＿T)',
                '╥﹏╥','(｡•́︿•̀｡)','>_<',
                '(•ˇ‸ˇ•｡)','｡◕ᴗ◕｡','(´•༝•`)',
            ]
        };
        const emojis = emojiData[category];
        emojis.forEach(emoji => {
            if(category === 'kaomoji') {
                const span = document.createElement('span');
                span.textContent = emoji;
                span.className = 'kaomoji';
                emojiContainer.appendChild(span);
                span.addEventListener('click', () => {
                    restoreSelection();
                    insertNodeAtCursor(document.createTextNode(emoji));
                    syncTextarea();
                    saveSelection();
                    emojiPicker.style.display = 'none';
                });
            } else {
                const img = document.createElement('img');
                img.src = emojiBaseUrl + emoji + '.svg';
                img.alt = `[emoji:${emoji}]`;
                img.setAttribute('data-emoji', emoji);
                emojiContainer.appendChild(img);
                img.addEventListener('click', () => {
                    insertEmojiImg(emoji);
                    emojiPicker.style.display = 'none';
                });
            }
        });
    }
    // emoji按钮，只负责弹窗
    let lastActiveCategory = 'emotion';
    emojiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (emojiPicker.style.display === 'none') {
            emojiPicker.style.display = 'block';
            loadEmojis(lastActiveCategory);
            setActiveClass(lastActiveCategory);
        } else {
            emojiPicker.style.display = 'none';
            clearActiveClass();
        }
    });
    emojiCategories.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const category = button.getAttribute('data-category');
            lastActiveCategory = category;
            loadEmojis(category);
            setActiveClass(category);
        });
    });
    document.addEventListener('click', (event) => {
        if (!emojiPicker.contains(event.target) && event.target !== emojiBtn) {
            emojiPicker.style.display = 'none';
            clearActiveClass();
        }
    });
    function clearActiveClass() {
        emojiCategories.forEach(btn => btn.classList.remove('active'));
    }
    function setActiveClass(category) {
        emojiCategories.forEach(button => {
            if (button.getAttribute('data-category') === category) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
    function htmlToShortcode(html) {
        html = html.replace(/<div>|<br\s*\/?>/gi, '\n');
        html = html.replace(/<img[^>]*data-emoji="([a-zA-Z0-9_]+)"[^>]*>/gi, function(_, emoji) {
            return `[emoji:${emoji}]`;
        });
        let tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }
    function syncTextarea() {
        textarea.value = htmlToShortcode(richEditor.innerHTML);
    }
    syncTextarea();
    const commentForm = document.getElementById('comment-form');
    if(commentForm){
        commentForm.addEventListener('submit', function() {
            syncTextarea();
        });
    }
});