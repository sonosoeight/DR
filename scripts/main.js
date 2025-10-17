const selectors = {
    heroTitle: document.querySelector('[data-hero-title]'),
    heroSubtitle: document.querySelector('[data-hero-subtitle]'),
    heroEyebrow: document.querySelector('[data-hero-eyebrow]'),
    wishButton: document.querySelector('[data-wish-button]'),
    playlistButton: document.querySelector('[data-playlist-button]'),
    playlistLabel: document.querySelector('[data-playlist-label]'),
    playlistPanel: document.querySelector('[data-playlist-panel]'),
    playlistNote: document.querySelector('[data-playlist-note]'),
    playlistList: document.querySelector('[data-playlist-list]'),
    starsGrid: document.querySelector('[data-stars]'),
    memoryPanel: document.querySelector('[data-memory-panel]'),
    memoryClose: document.querySelector('[data-close-panel]'),
    memoryType: document.querySelector('[data-memory-type]'),
    memoryTitle: document.querySelector('[data-memory-title]'),
    memoryMessage: document.querySelector('[data-memory-message]'),
    memoryMedia: document.querySelector('[data-memory-media]'),
    openAllButton: document.querySelector('[data-open-all]'),
    constellationsTitle: document.querySelector('[data-constellations-title]'),
    constellationsSubtitle: document.querySelector('[data-constellations-subtitle]'),
    wishlistTitle: document.querySelector('[data-wishlist-title]'),
    wishlistText: document.querySelector('[data-wishlist-text]'),
    wishlistList: document.querySelector('[data-wishlist-list]'),
    quizContainer: document.querySelector('[data-quiz]')
};

const state = {
    activeIndex: null,
    data: null
};

fetch('data/content.json')
    .then((response) => response.json())
    .then((content) => {
        state.data = content;
        hydrateHero(content);
        hydrateConstellations(content);
        hydrateWishlist(content);
        hydrateQuiz(content);
        attachEvents();
        document.documentElement.lang = content.language ?? 'ru';
    })
    .catch((error) => {
        console.error('Не удалось загрузить данные для страницы:', error);
    });

function hydrateHero(content) {
    const { hero, name } = content;
    if (!hero) return;

    selectors.heroTitle.textContent = hero.title.replaceAll('{name}', name);
    selectors.heroSubtitle.textContent = hero.subtitle;
    selectors.heroEyebrow.textContent = hero.eyebrow;
    selectors.wishButton.textContent = hero.wishButtonLabel;

    if (hero.playlist) {
        selectors.playlistLabel.textContent = hero.playlist.buttonLabel;
        selectors.playlistNote.textContent = hero.playlist.note;
        buildPlaylist(hero.playlist.tracks);
    }
}

function buildPlaylist(tracks = []) {
    selectors.playlistList.innerHTML = '';
    tracks.forEach((track, index) => {
        const item = document.createElement('li');
        
        // Extract YouTube video ID from URL
        const videoId = extractYouTubeId(track.url);
        
        if (videoId) {
            const playerContainer = document.createElement('div');
            playerContainer.className = 'playlist-player';
            
            const label = document.createElement('p');
            label.className = 'playlist-player__label';
            label.textContent = `${index + 1}. ${track.label}`;
            
            const iframe = document.createElement('iframe');
            iframe.className = 'playlist-player__iframe';
            iframe.src = `https://www.youtube.com/embed/${videoId}`;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            iframe.loading = 'lazy';
            iframe.title = track.label;
            
            playerContainer.appendChild(label);
            playerContainer.appendChild(iframe);
            item.appendChild(playerContainer);
        } else {
            // Fallback to regular link if URL parsing fails
            const link = document.createElement('a');
            link.href = track.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = `${index + 1}. ${track.label}`;
            item.appendChild(link);
        }
        
        selectors.playlistList.appendChild(item);
    });
}

function extractYouTubeId(url) {
    if (!url) return null;
    
    // Match various YouTube URL formats
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
        /youtube\.com\/embed\/([^&\s]+)/,
        /youtube\.com\/v\/([^&\s]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    return null;
}

function hydrateConstellations(content) {
    const { constellations, memories } = content;
    selectors.constellationsTitle.textContent = constellations.title;
    selectors.constellationsSubtitle.textContent = constellations.subtitle;
    selectors.openAllButton.textContent = constellations.finaleCta;

    selectors.starsGrid.innerHTML = '';
    memories.forEach((memory, index) => {
        const button = document.createElement('button');
        button.className = 'star';
        button.type = 'button';
        button.textContent = index + 1;
        button.dataset.index = index;
        button.setAttribute('aria-label', memory.title);
        button.addEventListener('click', () => openMemory(index));
        selectors.starsGrid.appendChild(button);
    });
}

function hydrateWishlist(content) {
    if (!content.wishlist) return;
    selectors.wishlistTitle.textContent = content.wishlist.title;
    selectors.wishlistText.textContent = content.wishlist.leading;
    selectors.wishlistList.innerHTML = '';

    content.wishlist.items.forEach((wish) => {
        const li = document.createElement('li');
        li.textContent = wish;
        selectors.wishlistList.appendChild(li);
    });
}

function hydrateQuiz(content) {
    const quiz = content.quiz;
    if (!quiz || !quiz.questions?.length) {
        document.getElementById('quiz').setAttribute('hidden', 'true');
        return;
    }

    selectors.quizContainer.innerHTML = '';
    quiz.questions.forEach((question, index) => {
        const card = document.createElement('article');
        card.className = 'quiz-card';

        const q = document.createElement('p');
        q.className = 'quiz-card__question';
        q.textContent = question.prompt;

        const revealBtn = document.createElement('button');
        revealBtn.type = 'button';
        revealBtn.className = 'quiz-card__reveal';
        revealBtn.textContent = 'Показать ответ';
        revealBtn.dataset.quizIndex = index;

        const a = document.createElement('p');
        a.className = 'quiz-card__answer';
        a.textContent = question.answer;
        a.hidden = true;

        revealBtn.addEventListener('click', () => {
            if (a.hidden) {
                a.hidden = false;
                revealBtn.textContent = 'Скрыть ответ';
            } else {
                a.hidden = true;
                revealBtn.textContent = 'Показать ответ';
            }
        });

        card.appendChild(q);
        card.appendChild(revealBtn);
        card.appendChild(a);
        selectors.quizContainer.appendChild(card);
    });
}

function attachEvents() {
    selectors.wishButton.addEventListener('click', handleWishClick);

    selectors.playlistButton.addEventListener('click', () => {
        const expanded = selectors.playlistButton.getAttribute('aria-expanded') === 'true';
        selectors.playlistButton.setAttribute('aria-expanded', String(!expanded));
        selectors.playlistPanel.hidden = expanded;
        if (!expanded) {
            selectors.playlistPanel.focus?.();
        }
    });

    selectors.memoryClose.addEventListener('click', closeMemory);
    selectors.openAllButton.addEventListener('click', runFinale);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMemory();
        }
    });
}

function handleWishClick() {
    fireConfetti();
    selectors.wishButton.classList.add('btn--active');
    setTimeout(() => {
        selectors.wishButton.classList.remove('btn--active');
    }, 800);
}

function openMemory(index) {
    const memory = state.data.memories[index];
    if (!memory) return;

    const previouslyActive = selectors.starsGrid.querySelector('.star--active');
    previouslyActive?.classList.remove('star--active');

    const activeBtn = selectors.starsGrid.querySelector(`[data-index="${index}"]`);
    activeBtn?.classList.add('star--active');

    selectors.memoryType.textContent = memory.type;
    selectors.memoryTitle.textContent = memory.title;
    selectors.memoryMessage.textContent = memory.message;
    updateMedia(memory);

    selectors.memoryPanel.hidden = false;
    selectors.memoryPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    state.activeIndex = index;
    fireConfetti({ spread: 45, particleCount: 110, scalar: 0.95 });
}

function closeMemory() {
    resetMedia();
    selectors.memoryPanel.hidden = true;
    const activeBtn = selectors.starsGrid.querySelector('.star--active');
    activeBtn?.classList.remove('star--active');
    state.activeIndex = null;
}

function updateMedia(memory) {
    resetMedia();

    if (memory.image) {
        const img = document.createElement('img');
        img.className = 'memory-card__image';
        img.src = memory.image;
        img.alt = memory.alt ?? '';
        selectors.memoryMedia.appendChild(img);
        selectors.memoryMedia.hidden = false;
    } else if (memory.video) {
        const video = document.createElement('video');
        video.className = 'memory-card__video';
        video.src = memory.video;
        video.controls = true;
        video.playsinline = true;
        video.preload = 'metadata';
        if (memory.poster) {
            video.poster = memory.poster;
        }
        selectors.memoryMedia.appendChild(video);
        selectors.memoryMedia.hidden = false;
    }
}

function resetMedia() {
    if (selectors.memoryMedia) {
        selectors.memoryMedia.innerHTML = '';
        selectors.memoryMedia.hidden = true;
    }
}

function runFinale() {
    if (!state.data) return;
    const interval = 280;
    const bursts = Math.min(5, state.data.memories.length);
    state.data.memories.slice(0, bursts).forEach((_, idx) => {
        setTimeout(() => fireConfetti({
            spread: 60 + idx * 5,
            particleCount: 120,
            origin: { x: 0.15 + idx * 0.17, y: 0.3 },
            scalar: 0.9
        }), idx * interval);
    });

    selectors.openAllButton.disabled = true;
    const finaleLabel = state.data.constellations?.finaleLabel ?? 'Ты наше главное сияние';
    const finaleCta = state.data.constellations?.finaleCta ?? selectors.openAllButton.textContent;
    selectors.openAllButton.textContent = finaleLabel;
    setTimeout(() => {
        selectors.openAllButton.disabled = false;
        selectors.openAllButton.textContent = finaleCta;
    }, 3600);
}

function fireConfetti(options = {}) {
    if (typeof confetti !== 'function') return;
    confetti({
        particleCount: 90,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#ff8fb1', '#ffe0f0', '#fdd3d5', '#f2a7b8'],
        scalar: 0.85,
        ...options
    });
}
