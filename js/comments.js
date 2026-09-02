/**
 * comments.js — Blog engagement panel for GDG Africa University
 * Renders at the bottom of a single blog post:
 *   1. Emoji reactions (one per emoji per visitor)
 *   2. Comments + Q&A (comment form; admins can mark replies as answers)
 *
 * Public visitors need no login. A visitor is identified by a UUID stored
 * in localStorage; the unique (post_id, emoji, visitor_id) constraint in
 * post_reactions prevents a single visitor reacting to the same emoji twice.
 */

import { supabase } from './supabase-config.js';

// ---------------------------------------------------------------------------
// Visitor identity: stable per browser for this site (dedupes reactions).
// ---------------------------------------------------------------------------
let VISITOR_ID = null;
try {
  VISITOR_ID = localStorage.getItem('gdg_visitor_id');
  if (!VISITOR_ID) {
    VISITOR_ID = crypto.randomUUID ? crypto.randomUUID() : 'xxxx-xxxx-xxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16));
    localStorage.setItem('gdg_visitor_id', VISITOR_ID);
  }
} catch (e) {
  VISITOR_ID = 'public-' + Date.now(); // localStorage unavailable — fallback
}

const REACTIONS = ['👍', '❤️', '🔥', '👏', '😂'];
const COMMENT_LIMIT = 2000;

// ---------------------------------------------------------------------------
// Load reactions & comments for a post, render the panel into the container.
// ---------------------------------------------------------------------------
export async function renderEngagement(postId, container) {
  if (!container) return;
  container.innerHTML = '';

  const [reactionsRes, commentsRes] = await Promise.all([
    supabase.from('post_reactions').select('emoji, visitor_id').eq('post_id', postId),
    supabase.from('post_comments').select('*').eq('post_id', postId).order('created_at', { ascending: true }),
  ]);

  // Aggregate reaction counts
  const counts = {};
  const myReactions = new Set();
  (reactionsRes.data || []).forEach(r => {
    counts[r.emoji] = (counts[r.emoji] || 0) + 1;
    if (r.visitor_id === VISITOR_ID) myReactions.add(r.emoji);
  });
  const totalReactions = Object.values(counts).reduce((a, b) => a + b, 0);

  const comments = commentsRes.data || [];

  container.innerHTML = `
    <div class="mt-12 pt-8 border-t border-gray-100">
      <div id="reactions-block">
        <p class="text-sm font-semibold text-brandTextSecondary uppercase tracking-wide mb-4">React to this post</p>
        <div id="reactions-bar" class="flex flex-wrap items-center gap-2 mb-2"></div>
        <p id="reactions-count" class="text-xs ${totalReactions ? '' : 'hidden'} text-brandTextSecondary mb-6">
          ${totalReactions} reaction${totalReactions === 1 ? '' : 's'} — <span class="text-google-blue">tap an emoji to react</span>
        </p>
      </div>

      <div id="comments-block">
        <div class="flex items-center justify-between mb-5">
          <p class="text-sm font-semibold text-brandTextSecondary uppercase tracking-wide">
            ${comments.length} Comment${comments.length === 1 ? '' : 's'}
          </p>
        </div>

        <form id="comment-form" class="mb-8 bg-brandBgTertiary border border-brandBorder rounded-2xl p-5">
          <div class="grid md:grid-cols-3 gap-3 mb-3">
            <input type="text" id="comment-name" name="name" required maxlength="100" placeholder="Your name*"
              class="w-full bg-white dark:bg-brandBgPrimary border border-brandBorder rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-google-blue transition-all text-sm" />
            <label class="md:col-span-2 flex items-center gap-2 text-sm text-brandTextSecondary">
              <input type="checkbox" id="comment-is-question" class="accent-google-blue w-4 h-4" />
              This is a question — I'd like a response from the team
            </label>
          </div>
          <textarea id="comment-content" name="content" required maxlength="${COMMENT_LIMIT}" rows="3"
            placeholder="Share your thoughts or ask a question..."
            class="w-full bg-white dark:bg-brandBgPrimary border border-brandBorder rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-google-blue transition-all text-sm resize-y mb-3"></textarea>
          <div class="flex items-center justify-between">
            <span class="text-[11px] text-brandTextSecondary/70"><span id="comment-char-count">0</span>/${COMMENT_LIMIT}</span>
            <button type="submit" id="comment-submit-btn"
              class="inline-flex items-center gap-2 bg-google-blue text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-google-blue/90 transition-all shadow-sm active:scale-[0.97]">
              Post Comment
            </button>
          </div>
          <p id="comment-message" class="hidden mt-3 text-sm font-semibold"></p>
        </form>

        <div id="comments-list" class="space-y-4"></div>
      </div>
    </div>
  `;

  renderReactionBar(counts, myReactions, postId, container);
  renderComments(comments, container);
  wireCommentForm(postId, container);
}

function renderReactionBar(counts, myReactions, postId, container) {
  const bar = container.querySelector('#reactions-bar');
  const countEl = container.querySelector('#reactions-count');
  const block = container.querySelector('#reactions-block');

  REACTIONS.forEach(emoji => {
    const my = myReactions.has(emoji);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-pressed', my ? 'true' : 'false');
    btn.title = my ? `You reacted ${emoji}` : `React ${emoji}`;
    btn.className = `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm font-semibold transition-all active:scale-[0.97] ${
      my
        ? 'bg-google-blue/15 border-google-blue/40 text-google-blue shadow-sm'
        : 'bg-brandBgTertiary border-brandBorder text-brandTextSecondary hover:border-google-blue/40 hover:-translate-y-0.5'
    }`;
    btn.innerHTML = `<span class="text-xl leading-none">${emoji}</span><span class="emoji-count">${counts[emoji] || 0}</span>`;

    btn.addEventListener('click', async () => {
      if (btn.dataset.busy) return;
      const alreadyReacted = btn.getAttribute('aria-pressed') === 'true';
      if (alreadyReacted) return; // one reaction per emoji per visitor
      btn.dataset.busy = '1';
      const { error } = await supabase.from('post_reactions').insert({
        post_id: postId,
        emoji,
        visitor_id: VISITOR_ID,
      }, { onConflict: 'post_id,emoji,visitor_id', ignoreDuplicates: true });

      if (error) {
        showMessage(block, 'Could not save your reaction right now. Please try again.', true);
        delete btn.dataset.busy;
        return;
      }
      // Optimistic UI: mark as reacted, bump count, show feedback.
      const n = btn.querySelector('.emoji-count');
      n.textContent = parseInt(n.textContent || '0', 10) + 1;
      btn.setAttribute('aria-pressed', 'true');
      btn.classList.add('bg-google-blue/15', 'border-google-blue/40', 'text-google-blue');
      btn.classList.remove('bg-brandBgTertiary', 'border-brandBorder', 'text-brandTextSecondary');
      const total = parseInt(countEl.textContent.split(' ')[0]) + 1;
      countEl.textContent = `${total} reaction${total === 1 ? '' : 's'} — tap an emoji to react`;
      countEl.classList.remove('hidden');
      delete btn.dataset.busy;
    });

    bar.appendChild(btn);
  });
}

function renderComments(comments, container) {
  const list = container.querySelector('#comments-list');
  if (!comments.length) {
    list.innerHTML = '<p class="text-sm text-brandTextSecondary/70">No comments yet — be the first to share your thoughts!</p>';
    return;
  }
  list.innerHTML = comments.map(c => {
    const initials = (c.name || '?').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    const date = new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const answerTag = c.is_answer
      ? '<span class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-google-green/15 text-google-green mb-2">✓ Team answer</span>'
      : '';
    const questionTag = c.is_question
      ? '<span class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-google-yellow/15 text-google-yellow mb-2">Question</span>'
      : '';
    return `
      <div class="flex gap-3 ${c.is_answer ? 'bg-google-green/5 border border-google-green/15 rounded-2xl p-4' : ''}">
        <div class="w-9 h-9 rounded-full bg-gradient-to-br from-google-blue to-google-green text-white flex items-center justify-center font-bold text-xs flex-shrink-0">${initials}</div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-semibold text-brandTextPrimary text-sm">${escapeHtml(c.name)}</span>
            <span class="text-[11px] text-brandTextSecondary/60">${date}</span>
          </div>
          <div class="flex flex-wrap gap-1 mt-1">${answerTag}${questionTag}</div>
          <p class="text-brandTextSecondary text-sm leading-relaxed mt-1 whitespace-pre-wrap break-words">${escapeHtml(c.content)}</p>
        </div>
      </div>`;
  }).join('');
}

function wireCommentForm(postId, container) {
  const form = container.querySelector('#comment-form');
  const content = container.querySelector('#comment-content');
  const charCount = container.querySelector('#comment-char-count');
  const btn = container.querySelector('#comment-submit-btn');
  const msg = container.querySelector('#comment-message');

  content.addEventListener('input', () => {
    charCount.textContent = content.value.length;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage(msg);
    const name = container.querySelector('#comment-name').value.trim();
    const text = content.value.trim();
    if (!name || !text) { showMessage(msg, 'Please enter your name and a comment.', true); return; }
    if (text.length > COMMENT_LIMIT) { showMessage(msg, `Comments are limited to ${COMMENT_LIMIT} characters.`, true); return; }

    const isQuestion = container.querySelector('#comment-is-question').checked;
    btn.disabled = true;
    btn.textContent = 'Posting...';

    const { error } = await supabase.from('post_comments').insert({
      post_id: postId,
      name,
      content: text,
      is_question: isQuestion,
      status: 'approved',
    });

    btn.disabled = false;
    btn.textContent = 'Post Comment';

    if (error) {
      showMessage(msg, 'Could not post your comment. Please try again.', true);
      return;
    }

    // Re-render the panel to include the new comment + reset the form.
    container.querySelector('#comment-name').value = '';
    content.value = '';
    charCount.textContent = '0';
    container.querySelector('#comment-is-question').checked = false;
    showMessage(msg, 'Thanks! Your comment is live.', false);
    setTimeout(() => renderEngagement(postId, container), 400);
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function showMessage(el, text, isError) {
  el.textContent = text;
  el.className = `mt-3 text-sm font-semibold ${isError ? 'text-red-500' : 'text-google-green'}`;
  el.classList.remove('hidden');
}
function hideMessage(el) { el.classList.add('hidden'); }
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
