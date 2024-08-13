import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { io , onlineUsers } from "../app.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access Token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation - not empty
  //validate - moblie no
  //check is user already exist:username , email
  //check for images, check for avatar
  //upload them to cloudinary ,avatar
  //create user object - create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return response

  const { username, email, fullName, password, mobileNumber, description } =
    req.body;
  console.log("email", email, "passowrd", password, "mobile", mobileNumber);

  if (
    [username, email, fullName, password, description].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }
  if (mobileNumber.length != 10) {
    throw new ApiError(400, "Not vaild mobile No");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }, { mobileNumber }],
  });
  if (existedUser) {
    throw new ApiError(
      409,
      "User with email or usermane or Mobile no already exist"
    );
  }

  console.log(req.files?.avatar[0]?.path);

  const avatarLocalPath = req.files?.avatar[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required1");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required2 to cloudinary");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    avatar: avatar.url,
    mobileNumber,
    email,
    fullName,
    password,
    description,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering new user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const registerUserSocket = async (data) => {
  const { username, email, fullName, password, mobileNumber, description } =
    data;

  if (
    [username, email, fullName, password, description].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (mobileNumber.length !== 10) {
    throw new ApiError(400, "Not a valid mobile number");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }, { mobileNumber }],
  });
  if (existedUser) {
    throw new ApiError(
      409,
      "User with email, username, or mobile number already exists"
    );
  }

  const avatar = data.avatar ? await uploadOnCloudinary(data.avatar) : null;

  const user = await User.create({
    username: username.toLowerCase(),
    avatar: avatar?.url || '',
    mobileNumber,
    email,
    fullName,
    password,
    description,
    });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering new user");
  }

  return createdUser;
};

const loginUser = asyncHandler(async (req, res) => {
  //request body --> get user details
  //login through  --> username || email
  //validation  -->  username || email || password
  //create  -->  check for Token
  //create  --> check and refresh token field are same from Db
  //send cookie

  const { email, username, password } = req.body;

  if (!email && !username) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Password does not match");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const session = {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    refreshToken,
  };
  user.sessions.push(session);
  await user.save({ validateBeforeSave: false });

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  // io.emit('user-login', { userId: user._id.toString(), username: user.username });
  // Emit the login event to Socket.IO
  io.emit("user-login", user._id.toString());

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
          sessions: user.sessions,
        },
        "User logged In Successfully"
      )
    );

});



const logoutUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, "No refresh token found");
  }

  await User.findByIdAndUpdate(req.user._id, {
    $pull: { sessions: { refreshToken } },
  });

 
  const options = {
    httpOnly: true,
    secure: true,
  };

//   io.emit("user-logout", req.user._id.toString());
// Remove user from the onlineUsers list
delete onlineUsers[req.user._id.toString()];

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getOnlineUsers = asyncHandler(async (req, res) => {
    // Count the number of keys in the onlineUsers object to get the number of online users
    const numberOfOnlineUsers = Object.keys(onlineUsers).length;
  
    return res.status(200).json(
      new ApiResponse(
        200,
        { count: numberOfOnlineUsers }, // Return the count instead of the array
        "Online users count retrieved successfully"
      )
    );
  });

const getUserSessions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("sessions");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user.sessions,
        "User sessions retrieved successfully"
      )
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  //!
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access Token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getUserSessions,
  registerUserSocket,
  getOnlineUsers
};
