<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // Register Method

    public function Register(RegisterRequest $request)
    {
        $request->validated();
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'password' => Hash::make($request->password),

        ]);
        $token = $user->createToken('token')->plainTextToken;
        $refreshToken = $user->createToken('authTokenRefresh')->plainTextToken;
        return response()->json([
            'user' => $user,
            'token' => $token,
            "message" => "User registered successfully",

        ], 200);
    }

    // Login Method
    public function Login(LoginRequest $request)
    {
        $request->validated();
        $credentials = request(['email', 'password']);

        if (!Auth::attempt($credentials)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        $user = $request->user();
        $token = $user->createToken('token')->plainTextToken;
        $refreshToken = $user->createToken('authTokenRefresh')->accessToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Login successful',
        ], 200);
    }

    // Logout Method
    public function logout(Request $request)
    {
        $user = $request->user();

        if ($user && $user->token()) {
            $user->token()->revoke();
        }

        return response()->json(['message' => 'Successfully logged out'], 200);
    }
}
