"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, Search, X } from "lucide-react";

const faqs = [
  {
    question: "How quickly will my groceries be delivered?",
    answer:
      "Most orders are delivered within 15–45 minutes depending on your location, store availability, and order size.",
    category: "Delivery",
  },
  {
    question: "Is there a minimum order value?",
    answer:
      "No, there is no minimum order requirement. However, delivery charges may vary based on your order amount.",
    category: "Pricing",
  },
  {
    question: "Can I schedule my grocery delivery?",
    answer:
      "Yes! You can choose an available delivery slot that best fits your schedule during checkout.",
    category: "Delivery",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept UPI, Credit/Debit Cards, Net Banking, Digital Wallets, and Cash on Delivery (where available).",
    category: "Payment",
  },
  {
    question: "Can I cancel or modify my order?",
    answer:
      "Yes. Orders can be modified or cancelled before the store begins preparing them. Visit the 'My Orders' section for available options.",
    category: "Orders",
  },
  {
    question: "What if an item is unavailable?",
    answer:
      "We'll notify you instantly. You can choose a replacement item, receive a refund, or remove the unavailable product from your order.",
    category: "Orders",
  },
  {
    question: "Do you offer contactless delivery?",
    answer:
      "Absolutely. Simply select the Contactless Delivery option during checkout, and your order will be left safely at your doorstep.",
    category: "Delivery",
  },
  {
    question: "How can I track my order?",
    answer:
      "You can track your order in real-time from the 'My Orders' page, including store preparation, rider pickup, and delivery status.",
    category: "Tracking",
  },
];

const categories = ["All", "Delivery", "Pricing", "Payment", "Orders", "Tracking"];

export default function FAQSection() {
  const [active, setActive] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = faq.question
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 px-6 md:px-16">
            <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">
                Frequently Asked Questions
            </h2>
        </div>

        {/* FAQ List */}
        <div className="max-w-4xl mx-auto">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No questions found matching your search.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="mt-4 text-green-600 hover:text-green-700 font-medium"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="group rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-sm transition-all duration-300 overflow-hidden"
                >
                  <button
                    onClick={() => setActive(active === index ? null : index)}
                    className="flex w-full items-center justify-between px-6 py-5 text-left hover:bg-gray-50/50 transition-colors duration-200"
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          {faq.category}
                        </span>
                        <span className="text-lg font-semibold text-gray-900">
                          {faq.question}
                        </span>
                      </div>
                    </div>
                    <div className={`p-2 rounded-full transition-all duration-300 ${
                      active === index ? "bg-green-100" : "bg-gray-100 group-hover:bg-gray-200"
                    }`}>
                      <ChevronDown
                        className={`h-5 w-5 text-gray-600 transition-transform duration-300 ${
                          active === index ? "rotate-180 text-green-600" : ""
                        }`}
                      />
                    </div>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      active === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-6 pb-6 pt-2">
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4" />
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Still have questions?{" "}
            <button className="text-green-600 font-semibold hover:text-green-700 transition-colors">
              Contact our support team
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}