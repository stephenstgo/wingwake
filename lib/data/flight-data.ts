import { FlightInfo, UploadedFile } from '@/components/flight-page-template';

// Helper function to create mock File objects
const createMockFile = (name: string, type: string, size: number): File => {
  const content = 'x'.repeat(Math.min(size, 1000));
  const blob = new Blob([content], { type });
  try {
    // @ts-expect-error - File constructor signature varies by environment
    const file = new File([blob], name, { type, lastModified: Date.now() });
    if (file.size !== size) {
      Object.defineProperty(file, 'size', { value: size, writable: false, configurable: true });
    }
    return file;
  } catch {
    const file = blob as unknown as File;
    Object.defineProperty(file, 'name', { value: name, writable: false });
    Object.defineProperty(file, 'size', { value: size, writable: false });
    return file;
  }
};

export const flightData: Record<string, { flightInfo: FlightInfo; initialFiles: UploadedFile[] }> = {
  demo: {
    flightInfo: {
      owner: 'Skyward Aviation LLC',
      aircraft: {
        model: 'Cessna 172N',
        registration: 'N00000',
      },
      pilot: {
        name: 'John Smith',
        ratings: 'ATP, CFI, CFII',
      },
      mechanic: {
        name: 'Michael Johnson',
        certification: 'A&P #1234567, IA',
      },
      insurance: {
        company: 'Aviation Insurance Group',
        policy: 'Policy #AIG-2024-789',
      },
      departure: {
        name: "Chicago O'Hare International",
        code: 'KORD',
      },
      arrival: {
        name: 'Los Angeles International',
        code: 'KLAX',
      },
    },
    initialFiles: [
      {
        id: 'reg-1',
        file: createMockFile('Aircraft_Registration_N00000.pdf', 'application/pdf', 245760),
        type: 'pdf',
        category: 'registration',
      },
      {
        id: 'aw-1',
        file: createMockFile('Airworthiness_Certificate.pdf', 'application/pdf', 189440),
        type: 'pdf',
        category: 'airworthiness',
      },
      {
        id: 'log-1',
        file: createMockFile('Engine_Logbook.pdf', 'application/pdf', 1024000),
        type: 'pdf',
        category: 'logbooks',
      },
      {
        id: 'log-2',
        file: createMockFile('Airframe_Logbook.pdf', 'application/pdf', 1536000),
        type: 'pdf',
        category: 'logbooks',
      },
      {
        id: 'log-3',
        file: createMockFile('Propeller_Logbook.pdf', 'application/pdf', 512000),
        type: 'pdf',
        category: 'logbooks',
      },
      {
        id: 'wb-1',
        file: createMockFile('Weight_Balance_Record.pdf', 'application/pdf', 307200),
        type: 'pdf',
        category: 'weight-balance',
      },
      {
        id: 'mech-1',
        file: createMockFile('Mechanic_Statement_Logbook_Entry.pdf', 'application/pdf', 128000),
        type: 'pdf',
        category: 'mechanic-statement',
      },
      {
        id: 'mech-2',
        file: createMockFile('Mechanic_Statement_Photo.jpg', 'image/jpeg', 245760),
        type: 'image',
        category: 'mechanic-statement',
      },
      {
        id: 'faa-1',
        file: createMockFile('FAA_Form_8130-6_Completed.pdf', 'application/pdf', 409600),
        type: 'pdf',
        category: 'faa-form',
      },
      {
        id: 'eq-1',
        file: createMockFile('Equipment_List.pdf', 'application/pdf', 102400),
        type: 'pdf',
        category: 'equipment-list',
      },
      {
        id: 'add-1',
        file: createMockFile('Insurance_Certificate.pdf', 'application/pdf', 204800),
        type: 'pdf',
        category: 'additional',
      },
      {
        id: 'add-2',
        file: createMockFile('Aircraft_Photos_1.jpg', 'image/jpeg', 512000),
        type: 'image',
        category: 'additional',
      },
      {
        id: 'add-3',
        file: createMockFile('Aircraft_Photos_2.jpg', 'image/jpeg', 486400),
        type: 'image',
        category: 'additional',
      },
    ],
  },
  delivery: {
    flightInfo: {
      owner: 'Southwest Aircraft Sales',
      aircraft: {
        model: 'Mooney M20J',
        registration: 'NFAKE1',
      },
      pilot: {
        name: 'Emily Rodriguez',
        ratings: 'ATP, CFI, MEI',
      },
      mechanic: {
        name: 'Thomas Anderson',
        certification: 'A&P #4567890',
      },
      insurance: {
        company: 'Desert Aviation Insurance',
        policy: 'Policy #DSR-2024-654',
      },
      departure: {
        name: 'Dallas/Fort Worth International',
        code: 'KDFW',
      },
      arrival: {
        name: 'Phoenix Sky Harbor International',
        code: 'KPHX',
      },
    },
    initialFiles: [
      {
        id: 'reg-1',
        file: createMockFile('Aircraft_Registration_NFAKE1.pdf', 'application/pdf', 245760),
        type: 'pdf',
        category: 'registration',
      },
    ],
  },
  maintenance: {
    flightInfo: {
      owner: 'East Coast Aviation Services',
      aircraft: {
        model: 'Beechcraft Bonanza A36',
        registration: 'NFAKE2',
      },
      pilot: {
        name: 'David Thompson',
        ratings: 'ATP, CFI',
      },
      mechanic: {
        name: 'James Wilson',
        certification: 'A&P #3456789, IA',
      },
      insurance: {
        company: 'Atlantic Aviation Insurance',
        policy: 'Policy #ATL-2024-321',
      },
      departure: {
        name: 'John F. Kennedy International',
        code: 'KJFK',
      },
      arrival: {
        name: 'Miami International',
        code: 'KMIA',
      },
    },
    initialFiles: [],
  },
  export: {
    flightInfo: {
      owner: 'Global Aircraft Exports Inc.',
      aircraft: {
        model: 'Cessna 182T',
        registration: 'NXXXXX',
      },
      pilot: {
        name: 'Richard Taylor',
        ratings: 'ATP, CFI',
      },
      mechanic: {
        name: 'Lisa Garcia',
        certification: 'A&P #7890123, IA',
      },
      insurance: {
        company: 'International Aviation Insurance',
        policy: 'Policy #INT-2024-258',
      },
      departure: {
        name: 'George Bush Intercontinental',
        code: 'KIAH',
      },
      arrival: {
        name: 'Toronto Pearson International',
        code: 'CYYZ',
      },
    },
    initialFiles: [],
  },
  storage: {
    flightInfo: {
      owner: 'Northern Aviation Holdings',
      aircraft: {
        model: 'Piper PA-28',
        registration: 'N456CD',
      },
      pilot: {
        name: 'Sarah Martinez',
        ratings: 'ATP, CFI',
      },
      mechanic: {
        name: 'Robert Brown',
        certification: 'A&P #2345678',
      },
      insurance: {
        company: 'Pacific Aviation Insurance',
        policy: 'Policy #PAC-2024-147',
      },
      departure: {
        name: 'Seattle-Tacoma International',
        code: 'KSEA',
      },
      arrival: {
        name: 'Portland International',
        code: 'KPDX',
      },
    },
    initialFiles: [],
  },
  weighing: {
    flightInfo: {
      owner: 'Midwest Aviation Services',
      aircraft: {
        model: 'Piper PA-32R',
        registration: 'N123AB',
      },
      pilot: {
        name: 'Daniel Kim',
        ratings: 'ATP, CFI',
      },
      mechanic: {
        name: 'Patricia Lee',
        certification: 'A&P #5678901, IA',
      },
      insurance: {
        company: 'Central Aviation Insurance',
        policy: 'Policy #CEN-2024-852',
      },
      departure: {
        name: 'Denver International',
        code: 'KDEN',
      },
      arrival: {
        name: 'Kansas City International',
        code: 'KMCI',
      },
    },
    initialFiles: [],
  },
  training: {
    flightInfo: {
      owner: 'Flight Training Academy',
      aircraft: {
        model: 'Cessna 152',
        registration: 'N789EF',
      },
      pilot: {
        name: 'Christopher Davis',
        ratings: 'CFI, CFII',
      },
      mechanic: {
        name: 'Nancy Wilson',
        certification: 'A&P #8901234',
      },
      insurance: {
        company: 'Training Aviation Insurance',
        policy: 'Policy #TRN-2024-369',
      },
      departure: {
        name: 'Phoenix Sky Harbor International',
        code: 'KPHX',
      },
      arrival: {
        name: 'Las Vegas McCarran International',
        code: 'KLAS',
      },
    },
    initialFiles: [],
  },
  repositioning: {
    flightInfo: {
      owner: 'Aircraft Leasing Corp',
      aircraft: {
        model: 'Beechcraft King Air C90',
        registration: 'N321GH',
      },
      pilot: {
        name: 'Mark Thompson',
        ratings: 'ATP, CFI, MEI',
      },
      mechanic: {
        name: 'Kevin White',
        certification: 'A&P #9012345, IA',
      },
      insurance: {
        company: 'Corporate Aviation Insurance',
        policy: 'Policy #COR-2024-741',
      },
      departure: {
        name: 'Atlanta Hartsfield-Jackson International',
        code: 'KATL',
      },
      arrival: {
        name: 'Charlotte Douglas International',
        code: 'KCLT',
      },
    },
    initialFiles: [],
  },
  inspection: {
    flightInfo: {
      owner: 'Northeast Aviation Group',
      aircraft: {
        model: 'Diamond DA40',
        registration: 'N99999',
      },
      pilot: {
        name: 'Jennifer White',
        ratings: 'ATP, CFI, CFII',
      },
      mechanic: {
        name: 'Steven Harris',
        certification: 'A&P #0123456, IA',
      },
      insurance: {
        company: 'Northeast Aviation Insurance',
        policy: 'Policy #NEA-2024-963',
      },
      departure: {
        name: 'Boston Logan International',
        code: 'KBOS',
      },
      arrival: {
        name: 'Hartford Bradley International',
        code: 'KBDL',
      },
    },
    initialFiles: [],
  },
};


