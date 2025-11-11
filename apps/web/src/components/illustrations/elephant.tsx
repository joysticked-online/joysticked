'use client';

import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';

const ELEPHANTS = {
  STEP_ONE: (
    <svg
      width="102"
      height="102"
      viewBox="0 0 80 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 30H18V36H12V30Z" fill="#262626" />
      <path d="M12 24H18V30H12V24Z" fill="#262626" />
      <path d="M12 18H18V24H12V18Z" fill="#262626" />
      <path d="M18 18H24V24H18V18Z" fill="#262626" />
      <path d="M18 24H24V30H18V24Z" fill="#262626" />
      <path d="M18 30H24V36H18V30Z" fill="#262626" />
      <path d="M20 12H26V18H20V12Z" fill="#262626" />
      <path d="M20 6H26V12H20V6Z" fill="#262626" />
      <path d="M26 6H32V12H26V6Z" fill="#262626" />
      <path d="M26 0H32V6H26V0Z" fill="#262626" />
      <path d="M26 12H32V18H26V12Z" fill="#262626" />
      <path d="M24 18H30V24H24V18Z" fill="#262626" />
      <path d="M24 24H30V30H24V24Z" fill="#262626" />
      <path d="M24 30H30V36H24V30Z" fill="#262626" />
      <path d="M24 36H30V42H24V36Z" fill="#262626" />
      <path d="M24 42H30V48H24V42Z" fill="#262626" />
      <path d="M24 48H30V55H24V48Z" fill="#262626" />
      <path d="M18 43H24V49H18V43Z" fill="#262626" />
      <path d="M12 49H18V55H12V49Z" fill="#262626" />
      <path d="M18 49H24V55H18V49Z" fill="#262626" />
      <path d="M12 55H18V61H12V55Z" fill="#262626" />
      <path d="M6 57H12V63H6V57Z" fill="#262626" />
      <path d="M6 63H12V69H6V63Z" fill="#262626" />
      <path d="M6 69H12V75H6V69Z" fill="#262626" />
      <path d="M6 75H12V81H6V75Z" fill="#262626" />
      <path d="M0 75H6V81H0V75Z" fill="#262626" />
      <path d="M0 81H6V87H0V81Z" fill="#262626" />
      <path d="M0 87H6V91H0V87Z" fill="#262626" />
      <path d="M12 61H18V67H12V61Z" fill="#262626" />
      <path d="M12 67H18V73H12V67Z" fill="#262626" />
      <path d="M12 73H18V79H12V73Z" fill="#262626" />
      <path d="M12 79H18V85H12V79Z" fill="#262626" />
      <path d="M18 79H24V85H18V79Z" fill="#262626" />
      <path d="M18 73H24V79H18V73Z" fill="#262626" />
      <path d="M18 67H24V73H18V67Z" fill="#262626" />
      <path d="M18 61H24V67H18V61Z" fill="#262626" />
      <path d="M18 55H24V61H18V55Z" fill="#262626" />
      <path d="M32 55H38V61H32V55Z" fill="#262626" />
      <path d="M32 61H38V67H32V61Z" fill="#262626" />
      <path d="M32 67H38V73H32V67Z" fill="#262626" />
      <path d="M32 73H38V76H32V73Z" fill="#262626" />
      <path d="M38 73H44V76H38V73Z" fill="#262626" />
      <path d="M44 73H50V76H44V73Z" fill="#262626" />
      <path d="M50 73H56V76H50V73Z" fill="#262626" />
      <path d="M56 73H62V76H56V73Z" fill="#262626" />
      <path d="M38 67H44V73H38V67Z" fill="#262626" />
      <path d="M44 67H50V73H44V67Z" fill="#262626" />
      <path d="M39 76H45V82H39V76Z" fill="#262626" />
      <path d="M39 82H45V84H39V82Z" fill="#262626" />
      <path d="M45 82H51V84H45V82Z" fill="#262626" />
      <path d="M51 82H57V84H51V82Z" fill="#262626" />
      <path d="M32 84H38V90H32V84Z" fill="#262626" />
      <path d="M32 90H38V96H32V90Z" fill="#262626" />
      <path d="M38 90H44V96H38V90Z" fill="#262626" />
      <path d="M44 90H50V96H44V90Z" fill="#262626" />
      <path d="M52 90H58V96H52V90Z" fill="#262626" />
      <path d="M44 84H50V90H44V84Z" fill="#262626" />
      <path d="M50 84H52V90H50V84Z" fill="#262626" />
      <path d="M50 90H52V96H50V90Z" fill="#262626" />
      <path d="M38 84H44V90H38V84Z" fill="#262626" />
      <path d="M45 76H51V82H45V76Z" fill="#262626" />
      <path d="M51 76H57V82H51V76Z" fill="#262626" />
      <path d="M50 67H56V73H50V67Z" fill="#262626" />
      <path d="M56 67H62V73H56V67Z" fill="#262626" />
      <path d="M62 67H65V73H62V67Z" fill="#262626" />
      <path d="M62 73H65V76H62V73Z" fill="#262626" />
      <path d="M38 61H44V67H38V61Z" fill="#262626" />
      <path d="M44 61H50V67H44V61Z" fill="#262626" />
      <path d="M50 61H56V67H50V61Z" fill="#262626" />
      <path d="M56 61H62V67H56V61Z" fill="#262626" />
      <path d="M62 61H65V67H62V61Z" fill="#262626" />
      <path d="M38 55H44V61H38V55Z" fill="#262626" />
      <path d="M44 55H50V61H44V55Z" fill="#262626" />
      <path d="M50 55H56V61H50V55Z" fill="#262626" />
      <path d="M56 55H62V61H56V55Z" fill="#262626" />
      <path d="M62 55H68V61H62V55Z" fill="#262626" />
      <path d="M65 61H71V63H65V61Z" fill="#262626" />
      <path d="M68 55H70V61H68V55Z" fill="#262626" />
      <path d="M70 57H71V61H70V57Z" fill="#262626" />
      <path d="M24 55H30V61H24V55Z" fill="#262626" />
      <path d="M24 61H30V67H24V61Z" fill="#262626" />
      <path d="M24 67H30V73H24V67Z" fill="#262626" />
      <path d="M24 73H30V79H24V73Z" fill="#262626" />
      <path d="M24 79H30V85H24V79Z" fill="#262626" />
      <path d="M30 79H32V85H30V79Z" fill="#262626" />
      <path d="M30 73H32V79H30V73Z" fill="#262626" />
      <path d="M30 67H32V73H30V67Z" fill="#262626" />
      <path d="M30 61H32V67H30V61Z" fill="#262626" />
      <path d="M30 55H32V61H30V55Z" fill="#262626" />
      <path d="M32 0H38V6H32V0Z" fill="#262626" />
      <path d="M32 6H38V12H32V6Z" fill="#262626" />
      <path d="M32 12H38V18H32V12Z" fill="#262626" />
      <path d="M30 18H36V24H30V18Z" fill="#262626" />
      <path d="M30 24H36V30H30V24Z" fill="#262626" />
      <path d="M30 30H36V36H30V30Z" fill="#262626" />
      <path d="M30 36H36V42H30V36Z" fill="#262626" />
      <path d="M30 42H36V48H30V42Z" fill="#262626" />
      <path d="M30 48H36V55H30V48Z" fill="#262626" />
      <path d="M38 0H44V6H38V0Z" fill="#262626" />
      <path d="M38 6H44V12H38V6Z" fill="#262626" />
      <path d="M38 12H44V18H38V12Z" fill="#262626" />
      <path d="M36 18H42V24H36V18Z" fill="#262626" />
      <path d="M36 24H42V30H36V24Z" fill="#262626" />
      <path d="M36 30H42V36H36V30Z" fill="#262626" />
      <path d="M36 36H42V42H36V36Z" fill="#262626" />
      <path d="M36 42H42V48H36V42Z" fill="#262626" />
      <path d="M36 48H42V55H36V48Z" fill="#262626" />
      <path d="M44 0H50V6H44V0Z" fill="#262626" />
      <path d="M44 6H50V12H44V6Z" fill="#262626" />
      <path d="M44 12H50V18H44V12Z" fill="#262626" />
      <path d="M42 18H48V24H42V18Z" fill="#262626" />
      <path d="M42 24H48V30H42V24Z" fill="#262626" />
      <path d="M42 30H48V36H42V30Z" fill="#262626" />
      <path d="M42 36H48V42H42V36Z" fill="#262626" />
      <path d="M42 42H48V48H42V42Z" fill="#262626" />
      <path d="M42 48H48V55H42V48Z" fill="#262626" />
      <path d="M50 0H56V6H50V0Z" fill="#262626" />
      <path d="M50 6H56V12H50V6Z" fill="#262626" />
      <path d="M50 12H56V18H50V12Z" fill="#262626" />
      <path d="M48 18H54V24H48V18Z" fill="#262626" />
      <path d="M48 24H54V30H48V24Z" fill="#262626" />
      <path d="M48 30H54V36H48V30Z" fill="#262626" />
      <path d="M48 36H54V42H48V36Z" fill="#262626" />
      <path d="M48 42H54V48H48V42Z" fill="#262626" />
      <path d="M58 49H64V55H58V49Z" fill="#262626" />
      <path d="M64 49H70V55H64V49Z" fill="#262626" />
      <path d="M70 49H76V55H70V49Z" fill="#262626" />
      <path d="M70 55H76V57H70V55Z" fill="#262626" />
      <path d="M76 49H79V57H76V49Z" fill="#262626" />
      <path d="M48 48H54V55H48V48Z" fill="#262626" />
      <path d="M56 0H62V6H56V0Z" fill="#262626" />
      <path d="M56 6H62V12H56V6Z" fill="#262626" />
      <path d="M56 12H62V18H56V12Z" fill="#262626" />
      <path d="M54 18H60V24H54V18Z" fill="#262626" />
      <path d="M54 24H60V30H54V24Z" fill="#262626" />
      <path d="M54 30H60V36H54V30Z" fill="#262626" />
      <path d="M54 36H60V42H54V36Z" fill="#262626" />
      <path d="M54 42H58V48H54V42Z" fill="#262626" />
      <path d="M54 48H58V55H54V48Z" fill="#262626" />
      <path d="M60 18H66V24H60V18Z" fill="#262626" />
      <path d="M60 24H66V30H60V24Z" fill="#262626" />
      <path d="M60 30H66V36H60V30Z" fill="#262626" />
      <path d="M60 36H66V42H60V36Z" fill="#262626" />
      <path d="M66 18H72V24H66V18Z" fill="#262626" />
      <path d="M66 24H72V30H66V24Z" fill="#262626" />
      <path d="M66 30H72V36H66V30Z" fill="#262626" />
      <path d="M66 36H72V42H66V36Z" fill="#262626" />
      <path d="M66 42H72V49H66V42Z" fill="#262626" />
      <path d="M72 18H78V24H72V18Z" fill="#262626" />
      <path d="M72 24H78V30H72V24Z" fill="#262626" />
      <path d="M72 30H78V36H72V30Z" fill="#262626" />
      <path d="M62 4H68V10H62V4Z" fill="#262626" />
      <path d="M68 4H74V10H68V4Z" fill="#262626" />
      <path d="M74 4H80V10H74V4Z" fill="#262626" />
    </svg>
  ),
  STEP_TWO: (
    <svg
      width="102"
      height="102"
      viewBox="0 0 92 99"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 81H14V87H8V81Z" fill="#262626" />
      <path d="M8 87H14V93H8V87Z" fill="#262626" />
      <path d="M14 87H20V93H14V87Z" fill="#262626" />
      <path d="M14 81H20V87H14V81Z" fill="#262626" />
      <path d="M14 75H20V81H14V75Z" fill="#262626" />
      <path d="M20 75H26V81H20V75Z" fill="#262626" />
      <path d="M20 69H26V75H20V69Z" fill="#262626" />
      <path d="M26 69H32V75H26V69Z" fill="#262626" />
      <path d="M26 75H32V81H26V75Z" fill="#262626" />
      <path d="M26 81H32V87H26V81Z" fill="#262626" />
      <path d="M32 81H38V87H32V81Z" fill="#262626" />
      <path d="M32 75H38V81H32V75Z" fill="#262626" />
      <path d="M32 69H38V75H32V69Z" fill="#262626" />
      <path d="M32 63H38V69H32V63Z" fill="#262626" />
      <path d="M26 63H32V69H26V63Z" fill="#262626" />
      <path d="M26 57H32V63H26V57Z" fill="#262626" />
      <path d="M32 57H38V63H32V57Z" fill="#262626" />
      <path d="M32 51H38V57H32V51Z" fill="#262626" />
      <path d="M26 51H32V57H26V51Z" fill="#262626" />
      <path d="M26 45H32V51H26V45Z" fill="#262626" />
      <path d="M15 45H21V51H15V45Z" fill="#262626" />
      <path d="M15 43H21V45H15V43Z" fill="#262626" />
      <path d="M21 43H27V45H21V43Z" fill="#262626" />
      <path d="M27 43H33V45H27V43Z" fill="#262626" />
      <path d="M13 50V43H15V50H13Z" fill="#262626" />
      <path d="M9 50H15V56H9V50Z" fill="#262626" />
      <path d="M3 50H9V56H3V50Z" fill="#262626" />
      <path d="M3 56H9V62H3V56Z" fill="#262626" />
      <path d="M9 56H15V62H9V56Z" fill="#262626" />
      <path d="M9 62H15V68H9V62Z" fill="#262626" />
      <path d="M3 62H9V68H3V62Z" fill="#262626" />
      <path d="M0 62H3V68H0V62Z" fill="#262626" />
      <path d="M0 56H3V62H0V56Z" fill="#262626" />
      <path d="M0 50H3V56H0V50Z" fill="#262626" />
      <path d="M15 51H21V55H15V51Z" fill="#262626" />
      <path d="M15 55H19V59H15V55Z" fill="#262626" />
      <path d="M15 59H19V62H15V59Z" fill="#262626" />
      <path d="M32 45H38V51H32V45Z" fill="#262626" />
      <path d="M21 30H27V36H21V30Z" fill="#262626" />
      <path d="M21 24H27V30H21V24Z" fill="#262626" />
      <path d="M21 18H27V24H21V18Z" fill="#262626" />
      <path d="M27 18H33V24H27V18Z" fill="#262626" />
      <path d="M27 24H33V30H27V24Z" fill="#262626" />
      <path d="M27 30H33V36H27V30Z" fill="#262626" />
      <path d="M27 12H33V18H27V12Z" fill="#262626" />
      <path d="M27 6H33V12H27V6Z" fill="#262626" />
      <path d="M33 6H39V12H33V6Z" fill="#262626" />
      <path d="M33 12H39V18H33V12Z" fill="#262626" />
      <path d="M33 18H39V24H33V18Z" fill="#262626" />
      <path d="M33 24H39V30H33V24Z" fill="#262626" />
      <path d="M33 30H39V36H33V30Z" fill="#262626" />
      <path d="M33 36H39V42H33V36Z" fill="#262626" />
      <path d="M33 42H38V45H33V42Z" fill="#262626" />
      <path d="M33 0H39V6H33V0Z" fill="#262626" />
      <path d="M39 0H45V6H39V0Z" fill="#262626" />
      <path d="M45 0H51V6H45V0Z" fill="#262626" />
      <path d="M51 0H57V6H51V0Z" fill="#262626" />
      <path d="M57 0H63V6H57V0Z" fill="#262626" />
      <path d="M57 6H63V12H57V6Z" fill="#262626" />
      <path d="M57 12H63V18H57V12Z" fill="#262626" />
      <path d="M57 18H63V24H57V18Z" fill="#262626" />
      <path d="M57 24H63V30H57V24Z" fill="#262626" />
      <path d="M57 30H63V36H57V30Z" fill="#262626" />
      <path d="M57 36H63V42H57V36Z" fill="#262626" />
      <path d="M56 48H62V54H56V48Z" fill="#262626" />
      <path d="M58 81H64V87H58V81Z" fill="#262626" />
      <path d="M68 81H74V87H68V81Z" fill="#262626" />
      <path d="M68 75H74V81H68V75Z" fill="#262626" />
      <path d="M74 75H76V81H74V75Z" fill="#262626" />
      <path d="M74 69H76V75H74V69Z" fill="#262626" />
      <path d="M76 75H82V81H76V75Z" fill="#262626" />
      <path d="M74 81H82V83H74V81Z" fill="#262626" />
      <path d="M76 69H82V75H76V69Z" fill="#262626" />
      <path d="M68 69H74V75H68V69Z" fill="#262626" />
      <path d="M68 54H74V61H68V54Z" fill="#262626" />
      <path d="M68 48H74V54H68V48Z" fill="#262626" />
      <path d="M74 48H80V54H74V48Z" fill="#262626" />
      <path d="M80 48H86V54H80V48Z" fill="#262626" />
      <path d="M86 48H92V54H86V48Z" fill="#262626" />
      <path d="M86 54H92V60H86V54Z" fill="#262626" />
      <path d="M80 54H86V60H80V54Z" fill="#262626" />
      <path d="M82 60H88V66H82V60Z" fill="#262626" />
      <path d="M82 66H88V72H82V66Z" fill="#262626" />
      <path d="M82 71H88V77H82V71Z" fill="#262626" />
      <path d="M82 77H88V83H82V77Z" fill="#262626" />
      <path d="M82 83H88V87H82V83Z" fill="#262626" />
      <path d="M74 83H82V87H74V83Z" fill="#262626" />
      <path d="M74 54H80V60H74V54Z" fill="#262626" />
      <path d="M64 81H68V87H64V81Z" fill="#262626" />
      <path d="M62 48H68V55H62V48Z" fill="#262626" />
      <path d="M56 54H62V60H56V54Z" fill="#262626" />
      <path d="M62 55H68V61H62V55Z" fill="#262626" />
      <path d="M56 60H62V66H56V60Z" fill="#262626" />
      <path d="M62 61H68V68H62V61Z" fill="#262626" />
      <path d="M56 66H62V72H56V66Z" fill="#262626" />
      <path d="M62 68H68V74H62V68Z" fill="#262626" />
      <path d="M56 72H62V78H56V72Z" fill="#262626" />
      <path d="M62 74H68V81H62V74Z" fill="#262626" />
      <path d="M56 78H62V81H56V78Z" fill="#262626" />
      <path d="M57 42H63V48H57V42Z" fill="#262626" />
      <path d="M63 6H69V12H63V6Z" fill="#262626" />
      <path d="M63 12H69V18H63V12Z" fill="#262626" />
      <path d="M63 18H69V24H63V18Z" fill="#262626" />
      <path d="M63 24H69V30H63V24Z" fill="#262626" />
      <path d="M63 30H69V36H63V30Z" fill="#262626" />
      <path d="M69 30H75V36H69V30Z" fill="#262626" />
      <path d="M69 36H75V42H69V36Z" fill="#262626" />
      <path d="M69 24H75V30H69V24Z" fill="#262626" />
      <path d="M69 18H75V24H69V18Z" fill="#262626" />
      <path d="M75 18H81V24H75V18Z" fill="#262626" />
      <path d="M75 24H81V30H75V24Z" fill="#262626" />
      <path d="M81 24H87V30H81V24Z" fill="#262626" />
      <path d="M75 30H81V36H75V30Z" fill="#262626" />
      <path d="M63 36H69V43H63V36Z" fill="#262626" />
      <path d="M69 6H75V12H69V6Z" fill="#262626" />
      <path d="M75 6H81V12H75V6Z" fill="#262626" />
      <path d="M51 6H57V12H51V6Z" fill="#262626" />
      <path d="M51 12H57V18H51V12Z" fill="#262626" />
      <path d="M51 18H57V24H51V18Z" fill="#262626" />
      <path d="M51 24H57V30H51V24Z" fill="#262626" />
      <path d="M51 30H57V36H51V30Z" fill="#262626" />
      <path d="M51 36H57V42H51V36Z" fill="#262626" />
      <path d="M50 48H56V54H50V48Z" fill="#262626" />
      <path d="M50 54H56V60H50V54Z" fill="#262626" />
      <path d="M50 60H56V66H50V60Z" fill="#262626" />
      <path d="M50 66H56V72H50V66Z" fill="#262626" />
      <path d="M50 72H56V78H50V72Z" fill="#262626" />
      <path d="M50 78H56V81H50V78Z" fill="#262626" />
      <path d="M51 42H57V48H51V42Z" fill="#262626" />
      <path d="M45 6H51V12H45V6Z" fill="#262626" />
      <path d="M45 12H51V18H45V12Z" fill="#262626" />
      <path d="M45 18H51V24H45V18Z" fill="#262626" />
      <path d="M45 24H51V30H45V24Z" fill="#262626" />
      <path d="M45 30H51V36H45V30Z" fill="#262626" />
      <path d="M45 36H51V42H45V36Z" fill="#262626" />
      <path d="M44 48H50V54H44V48Z" fill="#262626" />
      <path d="M44 54H50V60H44V54Z" fill="#262626" />
      <path d="M44 60H50V66H44V60Z" fill="#262626" />
      <path d="M44 66H50V72H44V66Z" fill="#262626" />
      <path d="M44 72H50V78H44V72Z" fill="#262626" />
      <path d="M44 78H50V81H44V78Z" fill="#262626" />
      <path d="M45 42H51V48H45V42Z" fill="#262626" />
      <path d="M39 6H45V12H39V6Z" fill="#262626" />
      <path d="M39 12H45V18H39V12Z" fill="#262626" />
      <path d="M39 18H45V24H39V18Z" fill="#262626" />
      <path d="M39 24H45V30H39V24Z" fill="#262626" />
      <path d="M39 30H45V36H39V30Z" fill="#262626" />
      <path d="M39 36H45V42H39V36Z" fill="#262626" />
      <path d="M38 48H44V54H38V48Z" fill="#262626" />
      <path d="M38 54H44V60H38V54Z" fill="#262626" />
      <path d="M38 60H44V66H38V60Z" fill="#262626" />
      <path d="M38 66H44V72H38V66Z" fill="#262626" />
      <path d="M38 72H44V78H38V72Z" fill="#262626" />
      <path d="M38 78H44V81H38V78Z" fill="#262626" />
      <path d="M38 42H45V48H38V42Z" fill="#262626" />
      <path d="M21 45H27V51H21V45Z" fill="#262626" />
      <path d="M21 51H27V55H21V51Z" fill="#262626" />
      <path d="M20 81H26V87H20V81Z" fill="#262626" />
      <path d="M20 87H26V93H20V87Z" fill="#262626" />
      <path d="M20 93H26V99H20V93Z" fill="#262626" />
      <path d="M14 93H20V99H14V93Z" fill="#262626" />
      <path d="M26 93H32V99H26V93Z" fill="#262626" />
    </svg>
  ),
  STEP_THREE: (
    <svg
      width="102"
      height="102"
      viewBox="0 0 88 101"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.3902 6.44681H26.8293V12.8936H20.3902V6.44681Z" fill="#262626" />
      <path d="M26.8293 0H33.2683V6.44681H26.8293V0Z" fill="#262626" />
      <path d="M26.8293 6.44681H33.2683V12.8936H26.8293V6.44681Z" fill="#262626" />
      <path d="M33.2683 6.44681H39.7073V12.8936H33.2683V6.44681Z" fill="#262626" />
      <path d="M33.2683 0H39.7073V6.44681H33.2683V0Z" fill="#262626" />
      <path d="M39.7073 0H46.1463V6.44681H39.7073V0Z" fill="#262626" />
      <path d="M46.1463 0H52.5854V6.44681H46.1463V0Z" fill="#262626" />
      <path d="M52.5854 0H61.1707V6.44681H52.5854V0Z" fill="#262626" />
      <path d="M52.5854 6.44681H59.0244V12.8936H52.5854V6.44681Z" fill="#262626" />
      <path d="M46.1463 6.44681H52.5854V12.8936H46.1463V6.44681Z" fill="#262626" />
      <path d="M39.7073 6.44681H46.1463V12.8936H39.7073V6.44681Z" fill="#262626" />
      <path d="M59.0244 6.44681H65.4634V12.8936H59.0244V6.44681Z" fill="#262626" />
      <path d="M65.4634 6.44681H71.9024V12.8936H65.4634V6.44681Z" fill="#262626" />
      <path d="M68.6829 12.8936H71.9024V13.9681H68.6829V12.8936Z" fill="#262626" />
      <path d="M71.9024 6.44681H81.561V13.9681H71.9024V6.44681Z" fill="#262626" />
      <path d="M62.2439 12.8936H68.6829V19.3404H62.2439V12.8936Z" fill="#262626" />
      <path d="M62.2439 19.3404H68.6829V25.7872H62.2439V19.3404Z" fill="#262626" />
      <path d="M62.2439 25.7872H68.6829V32.234H62.2439V25.7872Z" fill="#262626" />
      <path d="M62.2439 32.234H68.6829V38.6809H62.2439V32.234Z" fill="#262626" />
      <path d="M68.6829 20.4149H75.122V26.8617H68.6829V20.4149Z" fill="#262626" />
      <path d="M75.122 20.4149H81.561V26.8617H75.122V20.4149Z" fill="#262626" />
      <path d="M75.122 26.8617H81.561V40.8298H75.122V26.8617Z" fill="#262626" />
      <path d="M81.561 26.8617H88V34.383H81.561V26.8617Z" fill="#262626" />
      <path d="M68.6829 26.8617H75.122V33.3085H68.6829V26.8617Z" fill="#262626" />
      <path d="M68.6829 33.3085H75.122V39.7553H68.6829V33.3085Z" fill="#262626" />
      <path d="M75.122 53.7234H81.561V61.2447H75.122V53.7234Z" fill="#262626" />
      <path d="M55.8049 12.8936H62.2439V19.3404H55.8049V12.8936Z" fill="#262626" />
      <path d="M55.8049 19.3404H62.2439V25.7872H55.8049V19.3404Z" fill="#262626" />
      <path d="M55.8049 25.7872H62.2439V32.234H55.8049V25.7872Z" fill="#262626" />
      <path d="M55.8049 32.234H62.2439V38.6809H55.8049V32.234Z" fill="#262626" />
      <path d="M62.2439 38.6809H68.6829V45.1277H62.2439V38.6809Z" fill="#262626" />
      <path d="M68.6829 38.6809H75.122V45.1277H68.6829V38.6809Z" fill="#262626" />
      <path d="M68.6829 45.1277H75.122V51.5745H68.6829V45.1277Z" fill="#262626" />
      <path d="M68.6829 51.5745H75.122V58.0213H68.6829V51.5745Z" fill="#262626" />
      <path d="M68.6829 53.7234H75.122V60.1702H68.6829V53.7234Z" fill="#262626" />
      <path d="M68.6829 60.1702H75.122V66.617H68.6829V60.1702Z" fill="#262626" />
      <path d="M49.3659 12.8936H55.8049V19.3404H49.3659V12.8936Z" fill="#262626" />
      <path d="M49.3659 19.3404H55.8049V25.7872H49.3659V19.3404Z" fill="#262626" />
      <path d="M49.3659 25.7872H55.8049V32.234H49.3659V25.7872Z" fill="#262626" />
      <path d="M49.3659 32.234H55.8049V38.6809H49.3659V32.234Z" fill="#262626" />
      <path d="M55.8049 38.6809H62.2439V45.1277H55.8049V38.6809Z" fill="#262626" />
      <path d="M42.9268 12.8936H49.3659V19.3404H42.9268V12.8936Z" fill="#262626" />
      <path d="M42.9268 19.3404H49.3659V25.7872H42.9268V19.3404Z" fill="#262626" />
      <path d="M42.9268 25.7872H49.3659V32.234H42.9268V25.7872Z" fill="#262626" />
      <path d="M42.9268 32.234H49.3659V38.6809H42.9268V32.234Z" fill="#262626" />
      <path d="M49.3659 38.6809H55.8049V45.1277H49.3659V38.6809Z" fill="#262626" />
      <path d="M36.4878 12.8936H42.9268V19.3404H36.4878V12.8936Z" fill="#262626" />
      <path d="M36.4878 19.3404H42.9268V25.7872H36.4878V19.3404Z" fill="#262626" />
      <path d="M36.4878 25.7872H42.9268V32.234H36.4878V25.7872Z" fill="#262626" />
      <path d="M36.4878 32.234H42.9268V38.6809H36.4878V32.234Z" fill="#262626" />
      <path d="M42.9268 38.6809H49.3659V45.1277H42.9268V38.6809Z" fill="#262626" />
      <path d="M30.0488 12.8936H36.4878V19.3404H30.0488V12.8936Z" fill="#262626" />
      <path d="M30.0488 19.3404H36.4878V25.7872H30.0488V19.3404Z" fill="#262626" />
      <path d="M30.0488 25.7872H36.4878V32.234H30.0488V25.7872Z" fill="#262626" />
      <path d="M30.0488 32.234H36.4878V38.6809H30.0488V32.234Z" fill="#262626" />
      <path d="M36.4878 38.6809H42.9268V45.1277H36.4878V38.6809Z" fill="#262626" />
      <path d="M23.6098 12.8936H30.0488V19.3404H23.6098V12.8936Z" fill="#262626" />
      <path d="M23.6098 19.3404H30.0488V25.7872H23.6098V19.3404Z" fill="#262626" />
      <path d="M23.6098 25.7872H30.0488V32.234H23.6098V25.7872Z" fill="#262626" />
      <path d="M23.6098 32.234H30.0488V40.8298H23.6098V32.234Z" fill="#262626" />
      <path d="M13.9512 33.3085H23.6098V40.8298H13.9512V33.3085Z" fill="#262626" />
      <path d="M13.9512 26.8617H23.6098V33.3085H13.9512V26.8617Z" fill="#262626" />
      <path d="M13.9512 20.4149H23.6098V26.8617H13.9512V20.4149Z" fill="#262626" />
      <path d="M20.3902 12.8936H23.6098V20.4149H20.3902V12.8936Z" fill="#262626" />
      <path d="M30.0488 38.6809H36.4878V45.1277H30.0488V38.6809Z" fill="#262626" />
      <path d="M20.3902 47.2766H26.8293V53.7234H20.3902V47.2766Z" fill="#262626" />
      <path d="M13.9512 53.7234H20.3902V60.1702H13.9512V53.7234Z" fill="#262626" />
      <path d="M7.5122 60.1702H13.9512V66.617H7.5122V60.1702Z" fill="#262626" />
      <path d="M7.5122 66.617H13.9512V73.0638H7.5122V66.617Z" fill="#262626" />
      <path d="M7.5122 73.0638H13.9512V79.5106H7.5122V73.0638Z" fill="#262626" />
      <path d="M7.5122 79.5106H13.9512V88.1064H7.5122V79.5106Z" fill="#262626" />
      <path d="M0 85.9575H7.5122V92.4043H0V85.9575Z" fill="#262626" />
      <path d="M0 92.4043H7.5122V94.5532H0V92.4043Z" fill="#262626" />
      <path d="M13.9512 60.1702H20.3902V66.617H13.9512V60.1702Z" fill="#262626" />
      <path d="M13.9512 66.617H20.3902V73.0638H13.9512V66.617Z" fill="#262626" />
      <path d="M13.9512 73.0638H20.3902V79.5106H13.9512V73.0638Z" fill="#262626" />
      <path d="M13.9512 79.5106H20.3902V88.1064H13.9512V79.5106Z" fill="#262626" />
      <path d="M20.3902 60.1702H26.8293V66.617H20.3902V60.1702Z" fill="#262626" />
      <path d="M20.3902 66.617H26.8293V73.0638H20.3902V66.617Z" fill="#262626" />
      <path d="M20.3902 73.0638H26.8293V79.5106H20.3902V73.0638Z" fill="#262626" />
      <path d="M20.3902 79.5106H26.8293V88.1064H20.3902V79.5106Z" fill="#262626" />
      <path d="M26.8293 60.1702H33.2683V66.617H26.8293V60.1702Z" fill="#262626" />
      <path d="M26.8293 66.617H33.2683V73.0638H26.8293V66.617Z" fill="#262626" />
      <path d="M26.8293 73.0638H33.2683V79.5106H26.8293V73.0638Z" fill="#262626" />
      <path d="M26.8293 79.5106H34.3415V88.1064H26.8293V79.5106Z" fill="#262626" />
      <path d="M0 79.5106H7.5122V85.9575H0V79.5106Z" fill="#262626" />
      <path d="M33.2683 60.1702H39.7073V66.617H33.2683V60.1702Z" fill="#262626" />
      <path d="M33.2683 66.617H39.7073V73.0638H33.2683V66.617Z" fill="#262626" />
      <path d="M33.2683 73.0638H39.7073V79.5106H33.2683V73.0638Z" fill="#262626" />
      <path d="M34.3415 79.5106H40.7805V81.6596H34.3415V79.5106Z" fill="#262626" />
      <path d="M40.7805 79.5106H46.1463V81.6596H40.7805V79.5106Z" fill="#262626" />
      <path d="M40.7805 81.6596H46.1463V87.0319H40.7805V81.6596Z" fill="#262626" />
      <path d="M34.3415 87.0319H39.7073V92.4043H34.3415V87.0319Z" fill="#262626" />
      <path d="M34.3415 92.4043H39.7073V97.7766H34.3415V92.4043Z" fill="#262626" />
      <path d="M34.3415 97.7766H39.7073V101H34.3415V97.7766Z" fill="#262626" />
      <path d="M39.7073 97.7766H45.0732V101H39.7073V97.7766Z" fill="#262626" />
      <path d="M39.7073 92.4043H45.0732V97.7766H39.7073V92.4043Z" fill="#262626" />
      <path d="M45.0732 93.4787H50.439V101H45.0732V93.4787Z" fill="#262626" />
      <path d="M50.439 93.4787H55.8049V101H50.439V93.4787Z" fill="#262626" />
      <path d="M55.8049 93.4787H61.1707V101H55.8049V93.4787Z" fill="#262626" />
      <path d="M39.7073 87.0319H45.0732V92.4043H39.7073V87.0319Z" fill="#262626" />
      <path d="M45.0732 87.0319H50.439V93.4787H45.0732V87.0319Z" fill="#262626" />
      <path d="M50.439 87.0319H52.5854V93.4787H50.439V87.0319Z" fill="#262626" />
      <path d="M52.5854 88.1064H54.7317V93.4787H52.5854V88.1064Z" fill="#262626" />
      <path d="M39.7073 60.1702H46.1463V66.617H39.7073V60.1702Z" fill="#262626" />
      <path d="M39.7073 66.617H46.1463V73.0638H39.7073V66.617Z" fill="#262626" />
      <path d="M39.7073 73.0638H46.1463V79.5106H39.7073V73.0638Z" fill="#262626" />
      <path d="M46.1463 60.1702H52.5854V66.617H46.1463V60.1702Z" fill="#262626" />
      <path d="M46.1463 66.617H52.5854V73.0638H46.1463V66.617Z" fill="#262626" />
      <path d="M46.1463 73.0638H52.5854V79.5106H46.1463V73.0638Z" fill="#262626" />
      <path d="M46.1463 79.5106H52.5854V87.0319H46.1463V79.5106Z" fill="#262626" />
      <path d="M52.5854 60.1702H59.0244V66.617H52.5854V60.1702Z" fill="#262626" />
      <path d="M52.5854 66.617H59.0244V73.0638H52.5854V66.617Z" fill="#262626" />
      <path d="M52.5854 73.0638H59.0244V79.5106H52.5854V73.0638Z" fill="#262626" />
      <path d="M52.5854 79.5106H59.0244V88.1064H52.5854V79.5106Z" fill="#262626" />
      <path d="M59.0244 85.9575H61.1707V88.1064H59.0244V85.9575Z" fill="#262626" />
      <path d="M59.0244 60.1702H65.4634V66.617H59.0244V60.1702Z" fill="#262626" />
      <path d="M59.0244 66.617H65.4634V73.0638H59.0244V66.617Z" fill="#262626" />
      <path d="M59.0244 73.0638H65.4634V79.5106H59.0244V73.0638Z" fill="#262626" />
      <path d="M59.0244 79.5106H65.4634V85.9575H59.0244V79.5106Z" fill="#262626" />
      <path d="M65.4634 60.1702H68.6829V66.617H65.4634V60.1702Z" fill="#262626" />
      <path d="M65.4634 66.617H68.6829V73.0638H65.4634V66.617Z" fill="#262626" />
      <path d="M65.4634 73.0638H68.6829V79.5106H65.4634V73.0638Z" fill="#262626" />
      <path d="M65.4634 79.5106H68.6829V85.9575H65.4634V79.5106Z" fill="#262626" />
      <path d="M20.3902 53.7234H26.8293V60.1702H20.3902V53.7234Z" fill="#262626" />
      <path d="M26.8293 53.7234H33.2683V60.1702H26.8293V53.7234Z" fill="#262626" />
      <path d="M33.2683 53.7234H39.7073V60.1702H33.2683V53.7234Z" fill="#262626" />
      <path d="M39.7073 53.7234H46.1463V60.1702H39.7073V53.7234Z" fill="#262626" />
      <path d="M46.1463 53.7234H52.5854V60.1702H46.1463V53.7234Z" fill="#262626" />
      <path d="M52.5854 53.7234H59.0244V60.1702H52.5854V53.7234Z" fill="#262626" />
      <path d="M59.0244 53.7234H65.4634V60.1702H59.0244V53.7234Z" fill="#262626" />
      <path d="M65.4634 53.7234H68.6829V60.1702H65.4634V53.7234Z" fill="#262626" />
      <path d="M26.8293 47.2766H33.2683V53.7234H26.8293V47.2766Z" fill="#262626" />
      <path d="M33.2683 47.2766H39.7073V53.7234H33.2683V47.2766Z" fill="#262626" />
      <path d="M39.7073 47.2766H46.1463V53.7234H39.7073V47.2766Z" fill="#262626" />
      <path d="M46.1463 47.2766H52.5854V53.7234H46.1463V47.2766Z" fill="#262626" />
      <path d="M52.5854 47.2766H59.0244V53.7234H52.5854V47.2766Z" fill="#262626" />
      <path d="M59.0244 47.2766H61.1707V53.7234H59.0244V47.2766Z" fill="#262626" />
      <path d="M26.8293 40.8298H30.0488V47.2766H26.8293V40.8298Z" fill="#262626" />
      <path d="M30.0488 45.1277H68.6829V47.2766H30.0488V45.1277Z" fill="#262626" />
    </svg>
  ),
  STOPPED: (
    <svg
      width="102"
      height="102"
      viewBox="0 0 66 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 30H6V36H0V30Z" fill="#262626" />
      <path d="M12 30H18V36H12V30Z" fill="#262626" />
      <path d="M12 36H18V42H12V36Z" fill="#262626" />
      <path d="M12 42H18V48H12V42Z" fill="#262626" />
      <path d="M6 42H12V48H6V42Z" fill="#262626" />
      <path d="M6 48H12V54H6V48Z" fill="#262626" />
      <path d="M0 48H6V54H0V48Z" fill="#262626" />
      <path d="M0 54H6V60H0V54Z" fill="#262626" />
      <path d="M0 60H6V66H0V60Z" fill="#262626" />
      <path d="M0 66H6V72H0V66Z" fill="#262626" />
      <path d="M6 72H12V78H6V72Z" fill="#262626" />
      <path d="M6 78H12V81H6V78Z" fill="#262626" />
      <path d="M12 72H18V78H12V72Z" fill="#262626" />
      <path d="M12 78H18V84H12V78Z" fill="#262626" />
      <path d="M12 84H18V90H12V84Z" fill="#262626" />
      <path d="M12 90H18V96H12V90Z" fill="#262626" />
      <path d="M12 96H18V100H12V96Z" fill="#262626" />
      <path d="M18 72H24V78H18V72Z" fill="#262626" />
      <path d="M18 78H24V84H18V78Z" fill="#262626" />
      <path d="M18 84H24V90H18V84Z" fill="#262626" />
      <path d="M18 90H24V96H18V90Z" fill="#262626" />
      <path d="M18 96H24V100H18V96Z" fill="#262626" />
      <path d="M24 72H30V78H24V72Z" fill="#262626" />
      <path d="M24 78H30V84H24V78Z" fill="#262626" />
      <path d="M24 84H30V90H24V84Z" fill="#262626" />
      <path d="M24 90H30V96H24V90Z" fill="#262626" />
      <path d="M24 96H30V100H24V96Z" fill="#262626" />
      <path d="M30 72H36V78H30V72Z" fill="#262626" />
      <path d="M30 78H36V84H30V78Z" fill="#262626" />
      <path d="M30 84H36V90H30V84Z" fill="#262626" />
      <path d="M30 90H36V96H30V90Z" fill="#262626" />
      <path d="M30 96H36V100H30V96Z" fill="#262626" />
      <path d="M36 72H42V78H36V72Z" fill="#262626" />
      <path d="M36 78H42V84H36V78Z" fill="#262626" />
      <path d="M36 84H42V90H36V84Z" fill="#262626" />
      <path d="M36 90H42V93H36V90Z" fill="#262626" />
      <path d="M42 72H48V78H42V72Z" fill="#262626" />
      <path d="M42 78H48V84H42V78Z" fill="#262626" />
      <path d="M47 87H53V93H47V87Z" fill="#262626" />
      <path d="M42 84H48V90H42V84Z" fill="#262626" />
      <path d="M42 90H48V93H42V90Z" fill="#262626" />
      <path d="M6 66H12V72H6V66Z" fill="#262626" />
      <path d="M6 60H12V66H6V60Z" fill="#262626" />
      <path d="M6 54H12V60H6V54Z" fill="#262626" />
      <path d="M12 54H18V60H12V54Z" fill="#262626" />
      <path d="M24 54H30V60H24V54Z" fill="#262626" />
      <path d="M36 54H42V60H36V54Z" fill="#262626" />
      <path d="M12 48H18V54H12V48Z" fill="#262626" />
      <path d="M24 48H30V54H24V48Z" fill="#262626" />
      <path d="M36 48H42V54H36V48Z" fill="#262626" />
      <path d="M12 60H18V66H12V60Z" fill="#262626" />
      <path d="M24 60H30V66H24V60Z" fill="#262626" />
      <path d="M36 60H42V66H36V60Z" fill="#262626" />
      <path d="M12 66H18V72H12V66Z" fill="#262626" />
      <path d="M18 66H24V72H18V66Z" fill="#262626" />
      <path d="M24 66H30V72H24V66Z" fill="#262626" />
      <path d="M36 66H42V72H36V66Z" fill="#262626" />
      <path d="M30 66H36V72H30V66Z" fill="#262626" />
      <path d="M42 66H48V72H42V66Z" fill="#262626" />
      <path d="M18 60H24V66H18V60Z" fill="#262626" />
      <path d="M30 60H36V66H30V60Z" fill="#262626" />
      <path d="M42 60H48V66H42V60Z" fill="#262626" />
      <path d="M18 54H24V60H18V54Z" fill="#262626" />
      <path d="M30 54H36V60H30V54Z" fill="#262626" />
      <path d="M18 48H24V54H18V48Z" fill="#262626" />
      <path d="M30 48H36V54H30V48Z" fill="#262626" />
      <path d="M42 48H48V54H42V48Z" fill="#262626" />
      <path d="M42 54H48V60H42V54Z" fill="#262626" />
      <path d="M48 56H54V62H48V56Z" fill="#262626" />
      <path d="M48 62H54V68H48V62Z" fill="#262626" />
      <path d="M48 68H54V74H48V68Z" fill="#262626" />
      <path d="M12 18H18V24H12V18Z" fill="#262626" />
      <path d="M24 18H30V24H24V18Z" fill="#262626" />
      <path d="M24 30H30V36H24V30Z" fill="#262626" />
      <path d="M24 36H30V42H24V36Z" fill="#262626" />
      <path d="M24 42H30V48H24V42Z" fill="#262626" />
      <path d="M36 30H42V36H36V30Z" fill="#262626" />
      <path d="M36 36H42V42H36V36Z" fill="#262626" />
      <path d="M36 42H42V48H36V42Z" fill="#262626" />
      <path d="M36 18H42V24H36V18Z" fill="#262626" />
      <path d="M24 6H30V12H24V6Z" fill="#262626" />
      <path d="M12 6H18V12H12V6Z" fill="#262626" />
      <path d="M6 6H12V12H6V6Z" fill="#262626" />
      <path d="M6 12H12V18H6V12Z" fill="#262626" />
      <path d="M6 18H12V24H6V18Z" fill="#262626" />
      <path d="M0 18H6V24H0V18Z" fill="#262626" />
      <path d="M36 6H42V12H36V6Z" fill="#262626" />
      <path d="M0 24H6V30H0V24Z" fill="#262626" />
      <path d="M12 24H18V30H12V24Z" fill="#262626" />
      <path d="M12 12H18V18H12V12Z" fill="#262626" />
      <path d="M24 12H30V18H24V12Z" fill="#262626" />
      <path d="M24 24H30V30H24V24Z" fill="#262626" />
      <path d="M36 24H42V30H36V24Z" fill="#262626" />
      <path d="M36 12H42V18H36V12Z" fill="#262626" />
      <path d="M24 0H30V6H24V0Z" fill="#262626" />
      <path d="M12 0H18V6H12V0Z" fill="#262626" />
      <path d="M36 0H42V6H36V0Z" fill="#262626" />
      <path d="M6 24H12V30H6V24Z" fill="#262626" />
      <path d="M18 24H24V30H18V24Z" fill="#262626" />
      <path d="M18 12H24V18H18V12Z" fill="#262626" />
      <path d="M30 12H36V18H30V12Z" fill="#262626" />
      <path d="M30 24H36V30H30V24Z" fill="#262626" />
      <path d="M42 24H48V30H42V24Z" fill="#262626" />
      <path d="M48 24H54V30H48V24Z" fill="#262626" />
      <path d="M42 12H48V18H42V12Z" fill="#262626" />
      <path d="M30 0H36V6H30V0Z" fill="#262626" />
      <path d="M18 0H24V6H18V0Z" fill="#262626" />
      <path d="M6 30H12V36H6V30Z" fill="#262626" />
      <path d="M18 30H24V36H18V30Z" fill="#262626" />
      <path d="M18 36H24V42H18V36Z" fill="#262626" />
      <path d="M18 42H24V48H18V42Z" fill="#262626" />
      <path d="M18 18H24V24H18V18Z" fill="#262626" />
      <path d="M30 18H36V24H30V18Z" fill="#262626" />
      <path d="M30 30H36V36H30V30Z" fill="#262626" />
      <path d="M30 36H36V42H30V36Z" fill="#262626" />
      <path d="M30 42H36V48H30V42Z" fill="#262626" />
      <path d="M42 30H48V36H42V30Z" fill="#262626" />
      <path d="M48 30H54V36H48V30Z" fill="#262626" />
      <path d="M42 36H48V42H42V36Z" fill="#262626" />
      <path d="M48 36H54V42H48V36Z" fill="#262626" />
      <path d="M42 18H48V24H42V18Z" fill="#262626" />
      <path d="M48 18H54V24H48V18Z" fill="#262626" />
      <path d="M54 18H60V24H54V18Z" fill="#262626" />
      <path d="M54 24H60V30H54V24Z" fill="#262626" />
      <path d="M54 30H60V36H54V30Z" fill="#262626" />
      <path d="M60 24H66V30H60V24Z" fill="#262626" />
      <path d="M30 6H36V12H30V6Z" fill="#262626" />
      <path d="M18 6H24V12H18V6Z" fill="#262626" />
      <path d="M42 6H48V12H42V6Z" fill="#262626" />
      <path d="M48 6H54V12H48V6Z" fill="#262626" />
      <path d="M54 6H60V12H54V6Z" fill="#262626" />
    </svg>
  ),
  JUMPING: (
    <svg
      width="102"
      height="102"
      viewBox="0 0 102 102"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6.375 57.375H12.75V63.75H6.375V57.375Z" fill="#262626" />
      <path d="M6.375 70.125H12.75V76.5H6.375V70.125Z" fill="#262626" />
      <path d="M6.375 76.5H12.75V82.875H6.375V76.5Z" fill="#262626" />
      <path d="M6.375 63.75H12.75V70.125H6.375V63.75Z" fill="#262626" />
      <path d="M0 70.125H6.375V76.5H0V70.125Z" fill="#262626" />
      <path d="M0 63.75H6.375V70.125H0V63.75Z" fill="#262626" />
      <path d="M12.75 57.375H19.125V63.75H12.75V57.375Z" fill="#262626" />
      <path d="M12.75 70.125H19.125V76.5H12.75V70.125Z" fill="#262626" />
      <path d="M12.75 51H19.125V57.375H12.75V51Z" fill="#262626" />
      <path d="M12.75 63.75H19.125V70.125H12.75V63.75Z" fill="#262626" />
      <path d="M19.125 57.375H25.5V63.75H19.125V57.375Z" fill="#262626" />
      <path d="M19.125 51H25.5V57.375H19.125V51Z" fill="#262626" />
      <path d="M19.125 63.75H25.5V70.125H19.125V63.75Z" fill="#262626" />
      <path d="M25.5 57.375H31.875V63.75H25.5V57.375Z" fill="#262626" />
      <path d="M25.5 51H31.875V57.375H25.5V51Z" fill="#262626" />
      <path d="M25.5 63.75H31.875V70.125H25.5V63.75Z" fill="#262626" />
      <path d="M25.5 70.125H31.875V76.5H25.5V70.125Z" fill="#262626" />
      <path d="M25.5 76.5H31.875V82.875H25.5V76.5Z" fill="#262626" />
      <path d="M25.5 82.875H31.875V89.25H25.5V82.875Z" fill="#262626" />
      <path d="M12.75 89.25H19.125V95.625H12.75V89.25Z" fill="#262626" />
      <path d="M12.75 82.875H19.125V89.25H12.75V82.875Z" fill="#262626" />
      <path d="M19.125 76.5H25.5V82.875H19.125V76.5Z" fill="#262626" />
      <path d="M19.125 82.875H25.5V89.25H19.125V82.875Z" fill="#262626" />
      <path d="M6.375 89.25H12.75V95.625H6.375V89.25Z" fill="#262626" />
      <path d="M6.375 95.625H12.75V102H6.375V95.625Z" fill="#262626" />
      <path d="M31.875 57.375H38.25V63.75H31.875V57.375Z" fill="#262626" />
      <path d="M31.875 51H38.25V57.375H31.875V51Z" fill="#262626" />
      <path d="M31.875 63.75H38.25V70.125H31.875V63.75Z" fill="#262626" />
      <path d="M31.875 70.125H38.25V76.5H31.875V70.125Z" fill="#262626" />
      <path d="M31.875 76.5H38.25V82.875H31.875V76.5Z" fill="#262626" />
      <path d="M31.875 82.875H38.25V89.25H31.875V82.875Z" fill="#262626" />
      <path d="M19.125 89.25H25.5V95.625H19.125V89.25Z" fill="#262626" />
      <path d="M38.25 57.375H44.625V63.75H38.25V57.375Z" fill="#262626" />
      <path d="M38.25 51H44.625V57.375H38.25V51Z" fill="#262626" />
      <path d="M38.25 44.625H44.625V51H38.25V44.625Z" fill="#262626" />
      <path d="M38.25 38.25H44.625V44.625H38.25V38.25Z" fill="#262626" />
      <path d="M38.25 31.875H44.625V38.25H38.25V31.875Z" fill="#262626" />
      <path d="M38.25 25.5H44.625V31.875H38.25V25.5Z" fill="#262626" />
      <path d="M38.25 19.125H44.625V25.5H38.25V19.125Z" fill="#262626" />
      <path d="M38.25 12.75H44.625V19.125H38.25V12.75Z" fill="#262626" />
      <path d="M38.5156 6.375H44.8906V12.75H38.5156V6.375Z" fill="#262626" />
      <path d="M31.875 38.25H38.25V44.625H31.875V38.25Z" fill="#262626" />
      <path d="M31.875 31.875H38.25V38.25H31.875V31.875Z" fill="#262626" />
      <path d="M31.875 25.5H38.25V31.875H31.875V25.5Z" fill="#262626" />
      <path d="M31.875 19.125H38.25V25.5H31.875V19.125Z" fill="#262626" />
      <path d="M31.875 12.75H38.25V19.125H31.875V12.75Z" fill="#262626" />
      <path d="M25.5 38.25H31.875V44.625H25.5V38.25Z" fill="#262626" />
      <path d="M25.5 31.875H31.875V38.25H25.5V31.875Z" fill="#262626" />
      <path d="M25.5 25.5H31.875V31.875H25.5V25.5Z" fill="#262626" />
      <path d="M38.25 63.75H44.625V70.125H38.25V63.75Z" fill="#262626" />
      <path d="M38.25 70.125H44.625V76.5H38.25V70.125Z" fill="#262626" />
      <path d="M38.25 76.5H44.625V82.875H38.25V76.5Z" fill="#262626" />
      <path d="M38.25 82.875H44.625V89.25H38.25V82.875Z" fill="#262626" />
      <path d="M25.5 89.25H31.875V95.625H25.5V89.25Z" fill="#262626" />
      <path d="M25.5 95.625H31.875V102H25.5V95.625Z" fill="#262626" />
      <path d="M44.625 57.375H51V63.75H44.625V57.375Z" fill="#262626" />
      <path d="M44.625 51H51V57.375H44.625V51Z" fill="#262626" />
      <path d="M44.625 44.625H51V51H44.625V44.625Z" fill="#262626" />
      <path d="M44.625 38.25H51V44.625H44.625V38.25Z" fill="#262626" />
      <path d="M44.625 31.875H51V38.25H44.625V31.875Z" fill="#262626" />
      <path d="M44.625 25.5H51V31.875H44.625V25.5Z" fill="#262626" />
      <path d="M44.625 19.125H51V25.5H44.625V19.125Z" fill="#262626" />
      <path d="M44.625 12.75H51V19.125H44.625V12.75Z" fill="#262626" />
      <path d="M44.8906 6.375H51.2656V12.75H44.8906V6.375Z" fill="#262626" />
      <path d="M44.625 63.75H51V70.125H44.625V63.75Z" fill="#262626" />
      <path d="M44.625 70.125H51V76.5H44.625V70.125Z" fill="#262626" />
      <path d="M44.625 76.5H51V82.875H44.625V76.5Z" fill="#262626" />
      <path d="M44.625 82.875H51V89.25H44.625V82.875Z" fill="#262626" />
      <path d="M31.875 89.25H38.25V95.625H31.875V89.25Z" fill="#262626" />
      <path d="M31.875 95.625H38.25V102H31.875V95.625Z" fill="#262626" />
      <path d="M51 57.375H57.375V63.75H51V57.375Z" fill="#262626" />
      <path d="M51 51H57.375V57.375H51V51Z" fill="#262626" />
      <path d="M51 44.625H57.375V51H51V44.625Z" fill="#262626" />
      <path d="M51 38.25H57.375V44.625H51V38.25Z" fill="#262626" />
      <path d="M51 31.875H57.375V38.25H51V31.875Z" fill="#262626" />
      <path d="M51 25.5H57.375V31.875H51V25.5Z" fill="#262626" />
      <path d="M51 19.125H57.375V25.5H51V19.125Z" fill="#262626" />
      <path d="M51 12.75H57.375V19.125H51V12.75Z" fill="#262626" />
      <path d="M51.2656 6.375H57.6406V12.75H51.2656V6.375Z" fill="#262626" />
      <path d="M51 63.75H57.375V70.125H51V63.75Z" fill="#262626" />
      <path d="M51 70.125H57.375V76.5H51V70.125Z" fill="#262626" />
      <path d="M51 76.5H57.375V82.875H51V76.5Z" fill="#262626" />
      <path d="M51 82.875H57.375V89.25H51V82.875Z" fill="#262626" />
      <path d="M38.25 89.25H44.625V95.625H38.25V89.25Z" fill="#262626" />
      <path d="M38.25 95.625H44.625V102H38.25V95.625Z" fill="#262626" />
      <path d="M57.375 57.375H63.75V63.75H57.375V57.375Z" fill="#262626" />
      <path d="M57.375 51H63.75V57.375H57.375V51Z" fill="#262626" />
      <path d="M57.375 44.625H63.75V51H57.375V44.625Z" fill="#262626" />
      <path d="M57.375 38.25H63.75V44.625H57.375V38.25Z" fill="#262626" />
      <path d="M57.375 31.875H63.75V38.25H57.375V31.875Z" fill="#262626" />
      <path d="M57.375 25.5H63.75V31.875H57.375V25.5Z" fill="#262626" />
      <path d="M57.375 19.125H63.75V25.5H57.375V19.125Z" fill="#262626" />
      <path d="M57.375 12.75H63.75V19.125H57.375V12.75Z" fill="#262626" />
      <path d="M57.6406 6.375H64.0156V12.75H57.6406V6.375Z" fill="#262626" />
      <path d="M57.375 63.75H63.75V70.125H57.375V63.75Z" fill="#262626" />
      <path d="M57.375 70.125H63.75V76.5H57.375V70.125Z" fill="#262626" />
      <path d="M57.375 76.5H63.75V82.875H57.375V76.5Z" fill="#262626" />
      <path d="M57.375 82.875H63.75V89.25H57.375V82.875Z" fill="#262626" />
      <path d="M44.625 89.25H51V95.625H44.625V89.25Z" fill="#262626" />
      <path d="M44.625 95.625H51V102H44.625V95.625Z" fill="#262626" />
      <path d="M63.75 57.375H70.125V63.75H63.75V57.375Z" fill="#262626" />
      <path d="M63.75 51H70.125V57.375H63.75V51Z" fill="#262626" />
      <path d="M63.75 44.625H70.125V51H63.75V44.625Z" fill="#262626" />
      <path d="M63.75 38.25H70.125V44.625H63.75V38.25Z" fill="#262626" />
      <path d="M63.75 31.875H70.125V38.25H63.75V31.875Z" fill="#262626" />
      <path d="M63.75 25.5H70.125V31.875H63.75V25.5Z" fill="#262626" />
      <path d="M63.75 19.125H70.125V25.5H63.75V19.125Z" fill="#262626" />
      <path d="M63.75 12.75H70.125V19.125H63.75V12.75Z" fill="#262626" />
      <path d="M64.0156 6.375H70.3906V12.75H64.0156V6.375Z" fill="#262626" />
      <path d="M63.75 63.75H70.125V70.125H63.75V63.75Z" fill="#262626" />
      <path d="M63.75 70.125H70.125V76.5H63.75V70.125Z" fill="#262626" />
      <path d="M63.75 76.5H70.125V82.875H63.75V76.5Z" fill="#262626" />
      <path d="M63.75 82.875H70.125V89.25H63.75V82.875Z" fill="#262626" />
      <path d="M82.875 82.875H89.25V89.25H82.875V82.875Z" fill="#262626" />
      <path d="M82.875 76.5H89.25V82.875H82.875V76.5Z" fill="#262626" />
      <path d="M82.875 70.125H89.25V76.5H82.875V70.125Z" fill="#262626" />
      <path d="M51 89.25H57.375V95.625H51V89.25Z" fill="#262626" />
      <path d="M70.125 57.375H76.5V63.75H70.125V57.375Z" fill="#262626" />
      <path d="M70.125 51H76.5V57.375H70.125V51Z" fill="#262626" />
      <path d="M70.125 44.625H76.5V51H70.125V44.625Z" fill="#262626" />
      <path d="M70.125 38.25H76.5V44.625H70.125V38.25Z" fill="#262626" />
      <path d="M70.125 31.875H76.5V38.25H70.125V31.875Z" fill="#262626" />
      <path d="M70.125 25.5H76.5V31.875H70.125V25.5Z" fill="#262626" />
      <path d="M70.125 19.125H76.5V25.5H70.125V19.125Z" fill="#262626" />
      <path d="M70.125 12.75H76.5V19.125H70.125V12.75Z" fill="#262626" />
      <path d="M76.5 12.75H82.875V19.125H76.5V12.75Z" fill="#262626" />
      <path d="M70.125 63.75H76.5V70.125H70.125V63.75Z" fill="#262626" />
      <path d="M70.125 70.125H76.5V76.5H70.125V70.125Z" fill="#262626" />
      <path d="M70.125 76.5H76.5V82.875H70.125V76.5Z" fill="#262626" />
      <path d="M70.125 82.875H76.5V89.25H70.125V82.875Z" fill="#262626" />
      <path d="M89.25 82.875H95.625V89.25H89.25V82.875Z" fill="#262626" />
      <path d="M89.25 76.5H95.625V82.875H89.25V76.5Z" fill="#262626" />
      <path d="M89.25 70.125H95.625V76.5H89.25V70.125Z" fill="#262626" />
      <path d="M57.375 89.25H63.75V95.625H57.375V89.25Z" fill="#262626" />
      <path d="M76.5 57.375H82.875V63.75H76.5V57.375Z" fill="#262626" />
      <path d="M76.5 51H82.875V57.375H76.5V51Z" fill="#262626" />
      <path d="M76.5 44.625H82.875V51H76.5V44.625Z" fill="#262626" />
      <path d="M76.5 38.25H82.875V44.625H76.5V38.25Z" fill="#262626" />
      <path d="M76.5 31.875H82.875V38.25H76.5V31.875Z" fill="#262626" />
      <path d="M76.5 25.5H82.875V31.875H76.5V25.5Z" fill="#262626" />
      <path d="M82.875 38.25H89.25V44.625H82.875V38.25Z" fill="#262626" />
      <path d="M82.875 31.875H89.25V38.25H82.875V31.875Z" fill="#262626" />
      <path d="M82.875 25.5H89.25V31.875H82.875V25.5Z" fill="#262626" />
      <path d="M82.875 19.125H89.25V25.5H82.875V19.125Z" fill="#262626" />
      <path d="M82.875 12.75H89.25V19.125H82.875V12.75Z" fill="#262626" />
      <path d="M82.875 6.375H89.25V12.75H82.875V6.375Z" fill="#262626" />
      <path d="M82.875 0H89.25V6.375H82.875V0Z" fill="#262626" />
      <path d="M89.25 38.25H95.625V44.625H89.25V38.25Z" fill="#262626" />
      <path d="M89.25 31.875H95.625V38.25H89.25V31.875Z" fill="#262626" />
      <path d="M89.25 25.5H95.625V31.875H89.25V25.5Z" fill="#262626" />
      <path d="M89.25 19.125H95.625V25.5H89.25V19.125Z" fill="#262626" />
      <path d="M89.25 12.75H95.625V19.125H89.25V12.75Z" fill="#262626" />
      <path d="M89.25 6.375H95.625V12.75H89.25V6.375Z" fill="#262626" />
      <path d="M89.25 0H95.625V6.375H89.25V0Z" fill="#262626" />
      <path d="M95.625 31.875H102V38.25H95.625V31.875Z" fill="#262626" />
      <path d="M95.625 25.5H102V31.875H95.625V25.5Z" fill="#262626" />
      <path d="M95.625 19.125H102V25.5H95.625V19.125Z" fill="#262626" />
      <path d="M95.625 12.75H102V19.125H95.625V12.75Z" fill="#262626" />
      <path d="M95.625 6.375H102V12.75H95.625V6.375Z" fill="#262626" />
      <path d="M95.625 0H102V6.375H95.625V0Z" fill="#262626" />
      <path d="M76.5 63.75H82.875V70.125H76.5V63.75Z" fill="#262626" />
      <path d="M76.5 70.125H82.875V76.5H76.5V70.125Z" fill="#262626" />
      <path d="M76.5 76.5H82.875V82.875H76.5V76.5Z" fill="#262626" />
      <path d="M76.5 82.875H82.875V89.25H76.5V82.875Z" fill="#262626" />
      <path d="M95.625 82.875H102V89.25H95.625V82.875Z" fill="#262626" />
      <path d="M95.625 76.5H102V82.875H95.625V76.5Z" fill="#262626" />
      <path d="M95.625 70.125H102V76.5H95.625V70.125Z" fill="#262626" />
      <path d="M95.625 63.75H102V70.125H95.625V63.75Z" fill="#262626" />
      <path d="M95.625 57.375H102V63.75H95.625V57.375Z" fill="#262626" />
      <path d="M63.75 89.25H70.125V95.625H63.75V89.25Z" fill="#262626" />
      <path d="M44.625 51H51V57.375H44.625V51Z" fill="#262626" />
    </svg>
  )
} as const;

export function Elephant() {
  const [stepIndex, setStepIndex] = useState(0);
  const [isJumping, setIsJumping] = useState(false);

  const walkingSteps = useMemo(
    () => [ELEPHANTS.STEP_ONE, ELEPHANTS.STEP_TWO, ELEPHANTS.STEP_THREE],
    []
  );

  useEffect(() => {
    const runCycle = () => {
      setIsJumping(false);

      setTimeout(() => {
        setIsJumping(true);
      }, 500);

      setTimeout(() => {
        setIsJumping(false);
      }, 1005);
    };

    runCycle();

    const interval = setInterval(runCycle, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isJumping) {
        setStepIndex((prev) => (prev + 1) % 3);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [isJumping]);

  return (
    <motion.div
      initial={{ x: -550, y: -50 }}
      animate={{ x: 1100, y: [-50, 0, -100, -10] }}
      transition={{
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeOut',
        duration: 3,
        y: {
          duration: 1.5,
          repeat: Infinity,
          repeatType: 'loop',
          repeatDelay: 1.5
        }
      }}
      className="-translate-y-[60%] absolute z-10 translate-x-[520%]"
    >
      {isJumping ? ELEPHANTS.JUMPING : walkingSteps[stepIndex]}
    </motion.div>
  );
}
