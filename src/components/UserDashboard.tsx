import React from "react";
import HeroSection from "./HeroSection";
import CategorySlider from "./CategorySlider";
import connectDb from "@/lib/db";
import Grocery from "@/models/groceryModel";
import GroceryCards from "./GroceryCards";

async function UserDashboard() {
  await connectDb();
  const groceries = await Grocery.find({});
  const plainGrocery = JSON.parse(JSON.stringify(groceries));
  return (
    <>
      <HeroSection />
      <CategorySlider />
      <div className="w-[90%] md:w-[80%] mx-auto mt-10">
        <h2 className="text-2xl md:text-2xl font-bold text-green-700 mb-6 text-center">Popular Grocery Items</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {plainGrocery.map((item: any, index:number) => (
            <GroceryCards key={index} item={item} />
          ))}
        </div>
      </div>
    </>
  );
}

export default UserDashboard;
