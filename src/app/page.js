'use client'
import { Slider, styled } from "@mui/material";
import Image from "next/image";
import { useState } from "react";

const icons = [
  {
    ico: '/images/1-0.png',
    ico1: '/images/Worst.png',
    val: 1,
    txt: 'Yomon'
  },
  {
    ico: '/images/2-0.png',
    ico1: `/images/It's just fine'.png`,
    val: 2,
    txt: 'Yomon emas'
  },
  {
    ico: '/images/3-0.png',
    ico1: '/images/Neutral.png',
    val: 3,
    txt: 'Yaxshi'
  },
  {
    ico: '/images/4-0.png',
    ico1: '/images/Good.png',
    val: 4,
    txt: 'Juda yaxshi'
  },
  {
    ico: '/images/5-0.png',
    ico1: '/images/Loveit.png',
    val: 5,
    txt: 'Ajoyib'
  },
];

const CustomSlider = styled(Slider)({
  padding: '0',
  height: 8,
  '& .MuiSlider-rail': {
    backgroundColor: '#A5E0DD',
  },
  '& .MuiSlider-track': {
    backgroundColor: '#105955',
    border: 'none',
  },
  '& .MuiSlider-thumb': {
    width: 24,
    height: 24,
    backgroundColor: '#A5E0DD',
    border: '3px solid rgba(16, 89, 85, 0.63)',
    '&:hover, &.Mui-focusVisible': {
      boxShadow: 'none',
    },
    '&::after': {
      display: 'none',
    },
  },
  '& .MuiSlider-valueLabel': {
    display: 'none',
  },
  '& .MuiSlider-mark': {
    width: 0,
    height: 0,
  },
});

export default function page() {

  const [value, setValue] = useState(5);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-sky-400 to-yellow-200 p-2">
      <div className="w-full max-w-96 bg-white shadow-md p-5 rounded-xl">
        <form
          className="flex flex-col"
          onSubmit={handleSubmit}
        >
          <label
            htmlFor="name"
            className="text-[#2071B2] font-bold mb-2 text-sm"
          >
            Ismingiz
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            placeholder="Abdullayev Abdulla"
            className="border font-bold text-xs text-[#105955] rounded-lg shadow w-full px-2.5 py-3 outline-[#105955]"
          />
          <label
            htmlFor="phone"
            className="text-[#2071B2] font-bold text-sm mt-7"
          >
            Telefon raqamingiz
          </label>
          <div className="box relative mt-2">
            <label
              htmlFor="phone"
              className="font-bold text-xs text-gray-400 absolute top-1/2 -translate-y-1/2 left-2.5"
            >
              +998
            </label>
            <input
              type="number"
              name="phone"
              id="phone"
              required
              placeholder="99 999 99 99"
              className="border font-bold text-xs text-[#105955] rounded-lg shadow w-full px-2.5 py-3 pl-10 outline-[#105955]"
            />
          </div>
          <div className="box mt-7">
            <p className="text-[#2071B2] font-bold text-sm">Bizga baxo bering</p>
            <div className="box grid grid-cols-5 gap-x-5">
              {icons.map((item) => (
                <div
                  key={item.val}
                  className="box p-2.5 flex flex-col items-center cursor-pointer"
                >
                  <div
                    className="img w-10 h-10 relative"
                    onClick={() => setValue(item.val)}
                  >
                    <Image
                      fill
                      src={item.val === value ? item.ico1 : item.ico}
                      style={{ objectFit: 'contain' }}
                      alt={item.val}
                    />
                  </div>
                  <p className={`text-center font-bold text-xs ${item.val === value ? 'text-[#105955]' : 'text-[#A5E0DD]'}`}>
                    {item.txt}
                  </p>
                </div>
              ))}
            </div>
            <CustomSlider
              aria-label="Temperature"
              value={value}
              valueLabelDisplay="auto"
              onChange={handleChange}
              shiftStep={1}
              step={1}
              min={1}
              max={5}
            />
          </div>
          <textarea
            name="comment"
            id="comment"
            placeholder="Izohingizni kiriting..."
            className="border mt-7 rounded-lg h-40 px-2.5 py-3 outline-[#105955] font-semibold text-[#105955] text-sm shadow-md"
          ></textarea>
          <button
            type="submit"
            className="w-full p-3.5 mt-10 bg-[#20B2AA] rounded-lg text-white text-sm font-bold"
          >
            JO'NATISH
          </button>
        </form>
      </div>
    </div>
  );
};