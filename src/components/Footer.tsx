import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-green-800 text-white pt-10 pb-5 px-6 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Brand Section */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">FreshCart</h1>
          <p className="text-sm text-gray-300 max-w-md">
            Delivering fresh groceries to your doorstep with speed and care.
            Eat healthy, live better 🌿
          </p>
        </div>

        {/* Subscribe Section */}
        <div className="space-y-4 md:justify-self-end w-full md:max-w-md">
          <div>
            <h2 className="text-lg font-semibold">Stay Connected</h2>
            <p className="text-sm text-gray-300 mt-1">
              Subscribe for latest updates & offers
            </p>
          </div>

          <div className="flex gap-4 text-lg">
            <FaFacebookF className="cursor-pointer hover:text-green-400 transition" />
            <FaTwitter className="cursor-pointer hover:text-green-400 transition" />
            <FaInstagram className="cursor-pointer hover:text-green-400 transition" />
            <FaLinkedin className="cursor-pointer hover:text-green-400 transition" />
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-300 mt-8 pt-4 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} FreshCart. All rights reserved.
      </div>
    </footer>
  );
}