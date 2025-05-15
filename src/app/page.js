'use client'
import { Slider, styled } from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

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

const txt = [
  {
    val: 1,
    title: 'Ming bor uzr! 😔',
    txt: "Fikr bildirganingiz uchun rahmat. Afsuski, bu safar sizni xursand qila olmadik. Kelgusida buni albatta tuzatamiz."
  },
  {
    val: 2,
    title: 'Eʼtiboringiz uchun rahmat!',
    txt: "Sizning fikringiz biz uchun muhim. Yaxshilanish yo‘lida har bir izoh bizga yordam beradi."
  },
  {
    val: 3,
    title: 'Yaxshi!',
    txt: "Rahmat! Sizning bahoingiz bizga yo‘l ko‘rsatadi. Har doim yanada yaxshisi uchun harakatdamiz."
  },
  {
    val: 4,
    title: 'Zo‘r!',
    txt: "Fikringiz uchun katta rahmat! Sizga yoqqanidan juda xursandmiz. Yana uchrashguncha!"
  },
  {
    val: 5,
    title: 'Ajoyib! 😍',
    txt: "Sizdan shunday iliq fikr olish – biz uchun eng katta mukofot! Har doim sizga xizmat qilishdan mamnunmiz!"
  }
];

export default function page() {

  const [value, setValue] = useState(0);
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [text, setText] = useState('');
  const [free, setFree] = useState(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setFree(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value === 0) {
      setFree(true);
      return;
    };

    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setValue(0);
    setName('');
    setPhone('');
    setText('');
    setFree(false);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-sky-400 to-yellow-200 p-2">
      <div className="w-full max-w-96 bg-white shadow-md p-5 rounded-xl relative overflow-hidden">
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
            onChange={(e) => setName(e.target.value)}
            value={name}
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
              onChange={(e) => setPhone(e.target.value)}
              value={phone}
              onFocus={(e) => e.target.addEventListener("wheel", function (e) { e.preventDefault() }, { passive: false })}
              className="border font-bold text-xs text-[#105955] rounded-lg shadow w-full px-2.5 py-3 pl-10 outline-[#105955]"
            />
          </div>
          <div className="box mt-7">
            <p className="text-[#2071B2] font-bold text-sm">Bizga baxo bering</p>
            <div className="box grid grid-cols-5 gap-x-5">
              {icons.map((item) => (
                <div
                  key={item.val}
                  className={`box p-2.5 flex flex-col items-center cursor-pointer animate-duration-500 ${free ? 'animate-horizontal-vibration' : ''}`}
                  onClick={() => {
                    setValue(item.val);
                    setFree(false);
                  }}
                >
                  <div className={`img w-10 h-10 relative mb-0.5`}>
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
            required
            placeholder="Izohingizni kiriting..."
            onChange={(e) => setText(e.target.value)}
            value={text}
            className="border mt-7 rounded-lg h-40 px-2.5 py-3 outline-[#105955] font-semibold text-[#105955] text-sm shadow-md"
          ></textarea>
          <button
            type="submit"
            className="w-full p-3.5 mt-10 bg-[#20B2AA] rounded-lg text-white text-sm font-bold"
          >
            JO'NATISH
          </button>
        </form>
        <div className={`absolute left-0 w-full h-full z-10
          ${show ? 'bottom-0' : '-bottom-full'} transition-all duration-500 ease-in-out`}>
          <div className={`box absolute bottom-0 left-0 w-full h-1/2 bg-white z-10 rounded-t-3xl border-t-2 p-5 shadow-md`}>
            <div className="flex flex-col h-full">
              <div className="box flex justify-end">
                <button
                  onClick={() => handleClose()}
                >
                  <CloseRoundedIcon />
                </button>
              </div>
              <div className="text mt-3">
                {txt.map((item) => (
                  <div
                    key={item.val}
                    className={`box flex-col gap-y-5 ${item.val !== value ? 'hidden' : 'flex'}`}
                  >
                    <p className="font-bold text-[#105955] text-3xl text-center">
                      {item.val === value && item.title}
                    </p>
                    <p className="font-semibold text-[#105955] text-sm text-center">
                      {item.val === value && item.txt}
                    </p>
                  </div>
                ))}
              </div>
              <button
                className="bg-[#105955] w-full text-white p-3.5 rounded-lg text-sm font-bold mt-auto"
                onClick={() => handleClose()}
              >
                YOPISH
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};