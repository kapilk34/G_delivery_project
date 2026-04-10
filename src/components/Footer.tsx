import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-green-900 text-white pt-10 pb-5 px-6 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand Section */}
        <div>
          <h1 className="text-2xl font-bold text-green-400">FreshCart</h1>
          <p className="mt-3 text-sm text-gray-300">
            Delivering fresh groceries to your doorstep with speed and care.
            Eat healthy, live better 🌿
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Quick Links</h2>
          <ul className="space-y-2 text-gray-300">
            <li className="hover:text-green-400 cursor-pointer">Home</li>
            <li className="hover:text-green-400 cursor-pointer">Shop</li>
            <li className="hover:text-green-400 cursor-pointer">Categories</li>
            <li className="hover:text-green-400 cursor-pointer">Offers</li>
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Support</h2>
          <ul className="space-y-2 text-gray-300">
            <li className="hover:text-green-400 cursor-pointer">Help Center</li>
            <li className="hover:text-green-400 cursor-pointer">Track Order</li>
            <li className="hover:text-green-400 cursor-pointer">Return Policy</li>
            <li className="hover:text-green-400 cursor-pointer">FAQs</li>
          </ul>
        </div>

        {/* Newsletter + Social */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Stay Connected</h2>
          <p className="text-sm text-gray-300 mb-3">
            Subscribe for latest updates & offers
          </p>

          <div className="flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-3 py-2 w-full rounded-l-md text-white border-1 border-white-50 focus:outline-none"
            />
            <button className="bg-green-500 px-4 py-2 rounded-r-md hover:bg-green-600">
              Subscribe
            </button>
          </div>

          {/* Social Icons */}
          <div className="flex gap-4 mt-4">
            <FaFacebookF className="cursor-pointer hover:text-green-400" />
            <FaTwitter className="cursor-pointer hover:text-green-400" />
            <FaInstagram className="cursor-pointer hover:text-green-400" />
            <FaLinkedin className="cursor-pointer hover:text-green-400" />
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-green-700 mt-8 pt-4 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} FreshCart. All rights reserved.
      </div>
    </footer>
  );
}