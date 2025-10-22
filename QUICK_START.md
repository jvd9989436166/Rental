# ⚡ RentalMate - Quick Start Guide

## 🎯 Get Running in 30 Seconds!

### Step 1: Open the Project
```bash
cd c:/Users/jagad/OneDrive/Desktop/Rental
```

### Step 2: Open in Browser
**Double-click `index.html`** or right-click → Open with → Your Browser

**That's it!** 🎉 The app is now running!

---

## 🌐 Pages to Explore

1. **Landing Page** (`index.html`)
   - Click "Get Started" or "Login"
   - Try the signup flow
   - Select role (Owner/Tenant)

2. **Home/Explore** (`home.html`)
   - Use smart search: "PGs under ₹8000 near IT Park"
   - Apply filters
   - Click on any PG card

3. **PG Detail** (`detail.html`)
   - View image carousel
   - Switch between tabs
   - Click "Book Instantly"

4. **Booking Flow** (`booking.html`)
   - Select move-in date
   - Choose duration
   - Complete mock payment
   - See confetti celebration! 🎉

5. **Tenant Dashboard** (`tenant-dashboard.html`)
   - View bookings
   - Check payment history
   - Explore quick actions

6. **Owner Dashboard** (`owner-dashboard.html`)
   - See analytics
   - Manage properties
   - View bookings

---

## 🎨 Customization Tips

### Change Colors
Open any HTML file and find:
```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: { 500: '#0ea5e9' },  // Change this
                violet: { 500: '#a855f7' }     // And this
            }
        }
    }
}
```

### Add More PGs
Edit `js/search.js` → Find `mockPGData` array → Add your PG:
```javascript
{
    id: 7,
    name: "Your PG Name",
    location: "Your Location",
    rent: 8000,
    rating: 4.5,
    // ... more fields
}
```

### Modify Animations
Edit `css/styles.css` → Find `@keyframes` → Customize!

---

## 🚀 Deploy in 2 Minutes

### Netlify (Easiest)
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the `Rental` folder
3. Done! Your site is live! 🎉

### Vercel
```bash
npm i -g vercel
vercel
```

### GitHub Pages
1. Create GitHub repo
2. Push code
3. Enable Pages in Settings
4. Done!

---

## 🔥 Pro Tips

### Test Features
- **Smart Search**: Try "single room with wifi under 7000"
- **Filters**: Combine multiple filters
- **Booking**: Complete the full flow
- **Dashboards**: Check both owner and tenant views

### Debug
- Open **Chrome DevTools** (F12)
- Check **Console** for logs
- Use **Network** tab to see requests

### Customize
- All colors in Tailwind config
- All text is easily editable
- Images use Unsplash URLs (replace with yours)

---

## 📞 Need Help?

- **Setup Issues**: Check `SETUP_GUIDE.md`
- **Feature List**: See `FEATURES.md`
- **Full Details**: Read `PROJECT_SUMMARY.md`
- **Quick Overview**: Check `README.md`

---

## ✅ Checklist

- [ ] Opened `index.html` in browser
- [ ] Tested login/signup flow
- [ ] Searched for PGs
- [ ] Viewed PG details
- [ ] Completed booking flow
- [ ] Checked both dashboards
- [ ] Customized colors (optional)
- [ ] Ready to deploy!

---

## 🎉 You're All Set!

Your RentalMate platform is ready to use. Start exploring, customizing, and deploying!

**Questions?** All documentation is in the project folder.

**Happy Building!** 🚀
