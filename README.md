# Watvh

Watvh is a web application that allows users to explore and watch a vast collection of movies and TV shows. With a user-friendly interface and integration with the TMDb API, Watvh provides a delightful streaming experience. You can also save your favorite content to a watchlist and track previously watched content with time tracking features.

## Screenshot
![CleanShot 2024-05-19 at 01 59 18@2x](https://github.com/farhanmansurii/tv.spicy/assets/74182335/193045be-dff2-4f24-b24f-27d4d63d21e6)
![CleanShot 2024-05-19 at 01 59 43@2x](https://github.com/farhanmansurii/tv.spicy/assets/74182335/c4539edb-5348-421e-aa6a-448c2b0e5fe5)


## Features

- Browse a vast library of movies and TV shows.
- Stream movies and TV shows seamlessly.
- Add content to your watchlist for easy access.
- Track the time you've spent watching content.
- Responsive design for a great user experience on any device.

## Technologies Used

- [Next.js](https://nextjs.org/): A React framework for server-rendered applications.
- [Zustand](https://github.com/pmndrs/zustand): A small, fast, and scalable state management for React.
- [Tailwind CSS](https://tailwindcss.com/): A utility-first CSS framework for rapid UI development.
- [TMDb API](https://www.themoviedb.org/documentation/api): The TMDb API provides access to a vast movie and TV show database.

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tv.spicy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**

   Create a `.env.local` file in the root directory (this file is gitignored and won't be committed):
   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` and add your TMDB API credentials:
   - Get your API key from: https://www.themoviedb.org/settings/api
   - Get your Bearer Token from: https://www.themoviedb.org/settings/api (recommended)

   Add one of the following to `.env.local`:
   ```env
   NEXT_PUBLIC_TMDB_BEARER_TOKEN=your_bearer_token_here
   ```

   OR
   ```env
   NEXT_PUBLIC_TMDB_API_KEY=your_api_key_here
   ```

   **Note:** You only need ONE of the above. Bearer Token is recommended as it's more secure.

4. **Run the development server**
   ```bash
   npm run dev
   ```

# Usage

- **Home:** Explore the vast library of movies and TV shows, and select a title to watch.
- **Watchlist:** Save your favorite content to the watchlist for easy access.
- **History:** View a list of previously watched content and track your watch time.
- **Search:** Find specific movies and TV shows using the search feature.

## Screenshots

## License

This project is open-source and available under the MIT License.
