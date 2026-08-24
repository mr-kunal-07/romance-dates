# My Date Planner

Build a romantic, playful, mobile-first web application that I can send to my girlfriend.
The app should feel cute, modern, smooth, and slightly playful, with beautiful animations, hearts, soft gradients, and a polished UI.
MAIN USER FLOW:
1. Landing screen
- Show a romantic welcome message.
- Add a button such as "Let's see 👀".
- When clicked, open the first modal.
2. First modal:
Question:
"Are you single? ❤️"
Buttons:
- "Yes ❤️"
- "No 😏"
If the user clicks "No":
- Do NOT proceed to the next question.
- Keep the modal/page in the same place.
- Show a playful message such as:
  "Hmm... I think you need to think about that one again 😏"
- Optionally add a small playful animation.
If the user clicks "Yes":
- Smoothly transition to the second modal.
3. Second modal:
Question:
"Are you free? 👀"
Buttons:
- "Yes ❤️"
- "No 😌"
If the user clicks "No":
- Do NOT proceed.
- Stay on the current modal.
- Show a cute/playful message such as:
  "Aww... I'll wait for you 🥺❤️"
If the user clicks "Yes":
- Open the date-selection modal.
4. Date selection modal:
Title:
"When are you free for me? 🥰"
Show a beautiful calendar/date picker.
The user should be able to select:
- A single date
OR
- A date range
The available dates must be controlled by the admin panel.
5. Confirmation screen:
After selecting the date/date range, show a romantic confirmation message.
For example:
"Yay! It's a date! ❤️"
Then display:
"You chose: [selected date/date range]"
Add a final button:
"Confirm ❤️"
After confirmation, save the response.
ADMIN PANEL:
Create a secure-looking admin dashboard with:
1. Date Settings
- Enable/disable date selection
- Minimum available date
- Maximum available date
- Allow single date
- Allow date range
- Configure unavailable/blocked dates
2. Question Settings
Allow the admin to edit:
- "Are you single?" question
- "Are you free?" question
- Yes button text
- No button text
- Messages shown after clicking No
- Final confirmation message
3. Responses
Show submitted responses in a table/card view:
- Date/time of response
- Single? answer
- Free? answer
- Selected date
- Selected date range
DESIGN:
- Mobile-first because this will primarily be sent as a link to a phone.
- Romantic but not overly complicated.
- Pink/red/purple pastel color palette.
- Rounded cards and buttons.
- Smooth modal transitions.
- Heart animations.
- Subtle confetti animation after final confirmation.
- Beautiful typography.
- Large touch-friendly buttons.
- Responsive on desktop and mobile.
IMPORTANT BEHAVIOR:
- The "No" buttons should not allow the user to bypass the intended flow.
- The date picker must respect the dates configured in the admin panel.
- Persist admin settings and submitted responses in a database.
- Do not use hardcoded dates in the frontend.
- Add proper loading, error, and empty states.
- Validate the selected date/date range before submission.
- Prevent selecting blocked/unavailable dates.
- Make the UI feel like a personal romantic invitation rather than a generic form.
TECHNICAL REQUIREMENTS:
- Use React/Next.js with TypeScript.
- Use a clean component-based architecture.
- Use a database for admin settings and responses.
- Use reusable Modal, Button, Calendar, DateRangePicker, and Admin components.
- Keep the code clean and production-ready.
- Include authentication/protection for the admin panel.
- The public invitation page should not expose admin functionality.
Create the complete working application, including the public invitation flow, admin dashboard, database models, API/server actions, validation, responsive styling, animations, and polished empty/loading/error states.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://romance-dates.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5611843e-1251-4dc8-8d99-aaa125898207).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
