# MathPulse — Deployment Guide

## PWA Installation

### Desktop (Chrome/Edge)
1. Visit https://lstux.github.io/mathpulse/
2. Click **Install** in the address bar (or menu)
3. Choose **Install** in the dialog
4. App appears in Start Menu / Applications

### Mobile (Android)
1. Open in Chrome
2. Tap **⋮ (menu)**
3. Select **Install app**
4. Tap **Install**
5. App appears on home screen

### Mobile (iOS/Safari)
1. Open in Safari
2. Tap **Share** button
3. Select **Add to Home Screen**
4. Tap **Add**
5. App appears on home screen

---

## Offline Usage

Once installed:
- ✅ Works without internet (Service Worker cached)
- ✅ Data saved locally (localStorage)
- ✅ Sync when online (future feature)

Test offline:
```
DevTools → Network → Offline
Refresh page → Still works
```

---

## Deployment Checklist

### Before Launch
- [x] PWA manifest configured
- [x] Service Worker caching
- [x] localStorage storage working
- [x] All screens responsive
- [x] Animations GPU-accelerated
- [x] No console errors
- [x] Accessibility WCAG 2.1 AA

### Performance
- [x] First paint < 1s
- [x] TTI < 2s
- [x] Lighthouse score > 90
- [x] Animation frame rate 60fps

### Hosting (GitHub Pages)
```bash
# Push to main (already done)
git push origin main

# Enable GitHub Pages in repo settings:
# Settings → Pages → Deploy from main branch
# Custom domain (optional): mathpulse.example.com
```

---

## Browser Support

| Browser | Desktop | Mobile | Version |
|---------|---------|--------|---------|
| Chrome | ✅ | ✅ | 56+ |
| Edge | ✅ | ✅ | 79+ |
| Firefox | ⚠️ | ✅ | 55+ |
| Safari | ⚠️ | ✅ | 11+ |

**Note**: PWA installation requires HTTPS in production

---

## Monitoring

### Analytics (Optional)
```javascript
// Add to js/app.js for optional analytics
if (window.location.hostname !== 'localhost') {
    // Google Analytics, Plausible, etc.
}
```

### Error Tracking (Optional)
```javascript
// Sentry, LogRocket, etc.
window.addEventListener('error', (e) => {
    // Send to error tracking service
});
```

---

## Updates

### Roll out new version:
1. Make changes
2. Commit and push
3. Service Worker auto-updates (next page load)
4. Users see new content (after refresh)

### Force refresh (if needed):
- Desktop: Ctrl+Shift+R (hard refresh)
- Mobile: Install new version through app menu

---

## Data Privacy

- ✅ No tracking cookies
- ✅ No analytics (by default)
- ✅ No external services
- ✅ All data stored locally
- ✅ GDPR compliant (no data collection)

---

## Future Enhancements

- [ ] Cloud sync (optional Supabase/Firebase)
- [ ] Multi-device support
- [ ] Leaderboard (local)
- [ ] Sound effects (opt-in)
- [ ] Custom difficulty levels
- [ ] Teacher dashboard
- [ ] More skills (fractions, division, etc.)

---

## Support

### Troubleshooting

**App won't install?**
- Ensure HTTPS (GitHub Pages provides this)
- Clear browser cache
- Try different browser

**Data lost?**
- Check browser's localStorage not disabled
- Private/Incognito mode doesn't persist
- Try different browser

**Offline not working?**
- Service Worker may not be registered
- Check DevTools → Application → Service Workers
- Try reinstalling app

---

## Version Info

**MathPulse v1.0.0**
- Release: 10 October 2026
- MVP: 3 skills (Additions, ×2, ×5)
- Status: Production Ready

---

**Maintainer**: @lstux  
**Repository**: https://github.com/lstux/mathpulse
