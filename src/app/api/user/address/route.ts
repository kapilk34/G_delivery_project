import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

// 1. POST: Add a new address
export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { homeAddress, workAddress, otherAddress, city, state, pincode, landmark, isDefault } = await req.json();

    if (!city || !state || !pincode) {
      return NextResponse.json({ message: "City, State, and Pincode are required" }, { status: 400 });
    }

    // If setting as default, clear defaults on all other addresses first
    if (isDefault) {
      await User.updateOne(
        { email: session.user.email },
        { $set: { "addresses.$[].isDefault": false } }
      );
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $push: {
          addresses: {
            homeAddress,
            workAddress,
            otherAddress,
            city,
            state,
            pincode,
            landmark,
            isDefault: !!isDefault,
          },
        },
      },
      { new: true }
    ).select("-password");

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error adding address: ${error.message || error}` },
      { status: 500 }
    );
  }
}

// 2. PUT: Edit an existing address
export async function PUT(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { addressId, homeAddress, workAddress, otherAddress, city, state, pincode, landmark, isDefault } = await req.json();

    if (!addressId) {
      return NextResponse.json({ message: "Address ID is required" }, { status: 400 });
    }
    if (!city || !state || !pincode) {
      return NextResponse.json({ message: "City, State, and Pincode are required" }, { status: 400 });
    }

    // If setting as default, clear defaults on all other addresses first
    if (isDefault) {
      await User.updateOne(
        { email: session.user.email },
        { $set: { "addresses.$[].isDefault": false } }
      );
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email, "addresses._id": addressId },
      {
        $set: {
          "addresses.$.homeAddress": homeAddress,
          "addresses.$.workAddress": workAddress,
          "addresses.$.otherAddress": otherAddress,
          "addresses.$.city": city,
          "addresses.$.state": state,
          "addresses.$.pincode": pincode,
          "addresses.$.landmark": landmark,
          "addresses.$.isDefault": !!isDefault,
        },
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ message: "Address not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error updating address: ${error.message || error}` },
      { status: 500 }
    );
  }
}

// 3. PATCH: Set an address as default
export async function PATCH(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { addressId } = await req.json();

    if (!addressId) {
      return NextResponse.json({ message: "Address ID is required" }, { status: 400 });
    }

    // First reset all defaults
    await User.updateOne(
      { email: session.user.email },
      { $set: { "addresses.$[].isDefault": false } }
    );

    // Set standard default for target address
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email, "addresses._id": addressId },
      { $set: { "addresses.$.isDefault": true } },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ message: "Address not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error setting default address: ${error.message || error}` },
      { status: 500 }
    );
  }
}

// 4. DELETE: Remove an address
export async function DELETE(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    // Read addressId from request body
    const { addressId } = await req.json();

    if (!addressId) {
      return NextResponse.json({ message: "Address ID is required" }, { status: 400 });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $pull: {
          addresses: { _id: addressId },
        },
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error deleting address: ${error.message || error}` },
      { status: 500 }
    );
  }
}
