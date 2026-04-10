import Image from "next/image";

const testimonials = [
  {
    name: "Aman Sharma",
    role: "Regular Customer",
    image: "/users/user1.jpg",
    review:
      "Super fast delivery! Fresh groceries every time. This app has made my life so much easier.",
    rating: 5,
  },
  {
    name: "Priya Verma",
    role: "Working Professional",
    image: "/users/user2.jpg",
    review:
      "Amazing experience! The UI is smooth and delivery is always on time. Highly recommended.",
    rating: 4,
  },
  {
    name: "Rohit Singh",
    role: "Fitness Enthusiast",
    image: "/users/user3.jpg",
    review:
      "Best grocery service I've used. Quality products and great customer support!",
    rating: 5,
  },
  {
    name: "Neha Kapoor",
    role: "Home Maker",
    image: "/users/user4.jpg",
    review:
      "I love how easy it is to order groceries. The discounts and offers are great too!",
    rating: 5,
  },
  {
    name: "Arjun Mehta",
    role: "Startup Founder",
    image: "/users/user5.jpg",
    review:
      "Saves me so much time! The delivery is quick and the products are always fresh.",
    rating: 4,
  },
  {
    name: "Sneha Reddy",
    role: "Student",
    image: "/users/user6.jpg",
    review:
      "Affordable and reliable. Perfect for students like me who don’t have time to shop.",
    rating: 5,
  },
  {
    name: "Vikram Joshi",
    role: "Gym Trainer",
    image: "/users/user7.jpg",
    review:
      "Great quality fruits and vegetables. Always fresh and delivered on time.",
    rating: 5,
  },
  {
    name: "Kavita Nair",
    role: "Teacher",
    image: "/users/user8.jpg",
    review:
      "Very convenient app. Ordering groceries has never been this simple!",
    rating: 4,
  },
  {
    name: "Rahul Khanna",
    role: "IT Professional",
    image: "/users/user9.jpg",
    review:
      "Smooth experience and excellent service. The app design is also very user-friendly.",
    rating: 5,
  },
  {
    name: "Anjali Gupta",
    role: "Entrepreneur",
    image: "/users/user10.jpg",
    review:
      "Love the quick delivery and quality packaging. Highly dependable service!",
    rating: 5,
  },
];

export default function TestimonialSection() {
  return (
    <section className="bg-gray-50 py-16 overflow-hidden">
      <div className="text-center mb-12 px-6 md:px-16">
        <h2 className="text-4xl font-bold text-gray-800">
          What Our Customers Say
        </h2>
      </div>

      <style>
        {`
          @keyframes marquee {
            0% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-100%);
            }
          }
          .animate-marquee {
            display: flex;
            animation: marquee 40s linear infinite;
          }
          .group:hover .animate-marquee {
            animation-play-state: paused;
          }
        `}
      </style>

      <div className="relative flex overflow-hidden group w-full">
        <div className="animate-marquee flex flex-row gap-8 pr-8 min-w-max">
          {testimonials.map((user, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 w-80 shrink-0"
            >
              {/* User Info */}
              <div className="flex items-center gap-4 mb-4">
                {user.image && (
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={50}
                    height={50}
                    className="rounded-full object-cover"
                  />
                )}
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {user.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {user.role}
                  </p>
                </div>
              </div>

              {/* Review */}
              <p className="text-gray-600 mb-4 whitespace-normal">
                "{user.review}"
              </p>

              {/* Rating */}
              <div className="flex">
                {[...Array(user.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">
                    ★
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Duplicate container for a seamless infinite loop */}
        <div className="animate-marquee flex flex-row gap-8 pr-8 min-w-max" aria-hidden="true">
          {testimonials.map((user, index) => (
            <div
              key={index + testimonials.length}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 w-80 shrink-0"
            >
              <div className="flex items-center gap-4 mb-4">
                {user.image && (
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={50}
                    height={50}
                    className="rounded-full object-cover"
                  />
                )}
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {user.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {user.role}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 mb-4 whitespace-normal">
                "{user.review}"
              </p>
              <div className="flex">
                {[...Array(user.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">
                    ★
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}