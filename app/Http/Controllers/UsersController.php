<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
class UsersController extends Controller
{
    // Method to get all user
    public function getAllUsers()
    {
        $users = User::all();
        return $users;
    } 
    public function userAuth(){
        $user = auth()->user();
        return $user;
    }

    //get Specific User
    public function getUser($id){
        $user = User::findorFail($id);
        return response()->json([
            'status' =>200,
            "message" => "User",
            "data" => $user
        ]);
    }

    //Add New User
    public function addUser(Request $request){
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role' => 'required'
        ]);
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'password' => Hash::make($request->password),
            'role' => $request->role
        ]);
        return response()->json([
            'status' => 200,
            'message' => 'User Created',
            'user' => $user
        ]);
    }

    //Update User
    public function updateUser(Request $request,$id){
        $user = User::findorFail($id);
        $user->update([
            'name' => $request->name,
            'email' =>$request->email,
            'phone_number' => $request->phone_number,
            'password' => Hash::make($request->password),
            'role' => $request->role
        ]);
        return response()->json([
            'status' => 200,
            'message' => 'User Updated',
            'user' => $user
        ]);
    }

    public function deleteUser($id){
        $user = User::findorFail($id);
        $user->delete();
        return response()->json([
            'status' => 200,
            'message' => 'User Deleted'
        ]);
    }
}
