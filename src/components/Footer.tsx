import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-white/75 backdrop-blur-2xl border-b border-gray-200/40 shadow-sm shadow-black/5 text-gray-800 pt-10 pb-5 px-6 md:px-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="space-y-3">
          <img src="https://z2jsknicy5.ufs.sh/f/HcyboFZa5mETeZhyjgHcDxIylbosdVjB0gizWqJutYmG8PLS" alt="FreshCart Logo" className="h-10 w-auto" />
          <p className="text-sm text-gray-600 max-w-md">
            Delivering fresh groceries to your doorstep with speed and care.
            Eat healthy, live better 🌿
          </p>
        </div>

        {/* Subscribe Section */}
        <div className="space-y-4 md:justify-self-end w-full md:max-w-md">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Stay Connected</h2>
            <p className="text-sm text-gray-600 mt-1">
              Subscribe for latest updates & offers
            </p>
          </div>

          <div className="flex gap-4 text-lg">
            <FaFacebookF className="cursor-pointer text-gray-600 hover:text-green-600 transition" />
            <FaTwitter className="cursor-pointer text-gray-600 hover:text-green-600 transition" />
            <FaInstagram className="cursor-pointer text-gray-600 hover:text-green-600 transition" />
            <FaLinkedin className="cursor-pointer text-gray-600 hover:text-green-600 transition" />
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-300/60 mt-8 pt-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} FreshCart. All rights reserved.
      </div>
    </footer>
  );
}