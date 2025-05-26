import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { FcGoogle } from "react-icons/fc";
import axios from 'axios';

function Header() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    console.log(user);
  }, []);

  const login = useGoogleLogin({
    onSuccess: (codeResp) => GetUserProfile(codeResp),
    onError: (error) => console.log(error)
  });

  const GetUserProfile = (tokenInfo) => {
    axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`, {
      headers: {
        Authorization: `Bearer ${tokenInfo?.access_token}`,
        Accept: 'Application/json'
      }
    }).then((resp) => {
      console.log(resp);
      localStorage.setItem('user', JSON.stringify(resp.data));
      setOpenDialog(false);
      window.location.reload();
    });
  };

  return (
    <header className='sticky top-0 z-50 px-6 py-4 bg-[#0d1117]/90 backdrop-blur-md border-b border-[#1f2937] shadow-md flex justify-between items-center'>
      {/* Brand Name */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-blue-400 tracking-tight">
        NextTrip.<span className="text-white">AI</span>
      </h1>

      <div>
        {user ? (
          <div className='flex items-center gap-4'>
            <a href="/create-trip">
              <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2">
                Create Trip
              </Button>
            </a>
            <a href="/my-trips">
              <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2">
                My Trips
              </Button>
            </a>
            <Popover>
              <PopoverTrigger>
                <img src={user?.picture} alt="profile" className='rounded-full w-[38px] h-[38px] cursor-pointer border-2 border-blue-500' />
              </PopoverTrigger>
              <PopoverContent className="bg-white text-black rounded-md shadow-lg p-4">
                <h2
                  className="cursor-pointer hover:underline"
                  onClick={() => {
                    googleLogout();
                    localStorage.clear();
                    window.location.reload();
                  }}
                >
                  Logout
                </h2>
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <Button
            onClick={() => setOpenDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full"
          >
            Sign In
          </Button>
        )}
      </div>

      {/* Dialog for Google Sign-In */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-white text-black">
          <DialogHeader>
            <DialogDescription>
              <h2 className="font-bold text-lg mt-2">Sign In with Google</h2>
              <p className="mb-4 text-sm">Authenticate securely using your Google account</p>
              <Button
                onClick={login}
                className="w-full mt-2 flex gap-4 items-center justify-center bg-gray-100 hover:bg-gray-200 text-black"
              >
                <FcGoogle className="h-6 w-6" />
                Sign In With Google
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </header>
  );
}

export default Header;
