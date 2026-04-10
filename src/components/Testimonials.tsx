import Image from "next/image";

const testimonials = [
  {
    name: "Aman Sharma",
    role: "Regular Customer",
    image: "https://i.pinimg.com/1200x/b0/ad/ce/b0adce1b2cc94e4bc8e2fa0929be6a85.jpg",
    review:
      "Super fast delivery! Fresh groceries every time. This app has made my life so much easier.",
    rating: 5,
  },
  {
    name: "Priya Verma",
    role: "Working Professional",
    image: "https://i.pinimg.com/736x/3b/98/30/3b9830f74dd41eb5fa98542fc7f8be26.jpg",
    review:
      "Amazing experience! The UI is smooth and delivery is always on time. Highly recommended.",
    rating: 4,
  },
  {
    name: "Rohit Singh",
    role: "Fitness Enthusiast",
    image: "https://i.pinimg.com/736x/a7/1f/75/a71f75d4154c7f82f648f819921e2526.jpg",
    review:
      "Best grocery service I've used. Quality products and great customer support!",
    rating: 5,
  },
  {
    name: "Neha Kapoor",
    role: "Home Maker",
    image: "https://i.pinimg.com/736x/b3/36/80/b33680975a82f83a188a17ed2584563e.jpg",
    review:
      "I love how easy it is to order groceries. The discounts and offers are great too!",
    rating: 5,
  },
  {
    name: "Arjun Mehta",
    role: "Startup Founder",
    image: "https://i.pinimg.com/1200x/96/5d/2a/965d2a2094ec1fe38a0b4878484fbb7a.jpg",
    review:
      "Saves me so much time! The delivery is quick and the products are always fresh.",
    rating: 4,
  },
  {
    name: "Sneha Reddy",
    role: "Student",
    image: "https://i.pinimg.com/736x/39/8e/4f/398e4f78d4258b967dfeff179b072c57.jpg",
    review:
      "Affordable and reliable. Perfect for students like me who don’t have time to shop.",
    rating: 5,
  },
  {
    name: "Vikram Joshi",
    role: "Gym Trainer",
    image: "https://i.pinimg.com/736x/d9/66/91/d96691c487d4f17ddd7804b1817d2aa1.jpg",
    review:
      "Great quality fruits and vegetables. Always fresh and delivered on time.",
    rating: 5,
  },
  {
    name: "Kavita Nair",
    role: "Teacher",
    image: "https://i.pinimg.com/736x/5a/79/08/5a790832c1d81150b924f07cce5f815d.jpg",
    review:
      "Very convenient app. Ordering groceries has never been this simple!",
    rating: 4,
  },
  {
    name: "Rahul Khanna",
    role: "IT Professional",
    image: "https://i.pinimg.com/736x/12/d4/14/12d4141533884aa35c6ade513dbea2e8.jpg",
    review:
      "Smooth experience and excellent service. The app design is also very user-friendly.",
    rating: 5,
  },
  {
    name: "Anjali Gupta",
    role: "Entrepreneur",
    image: "https://i.pinimg.com/736x/8e/8f/d3/8e8fd3a1eebb3a61ef3f59fc5a72ee1b.jpg",
    review:
      "Love the quick delivery and quality packaging. Highly dependable service!",
    rating: 5,
  },
];

export default function TestimonialSection() {
  return (
    <section className=" py-16 overflow-hidden">
      <div className="text-center mb-12 px-6 md:px-16">
        <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">
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