"""
EcoSort AI - Waste Stream Classification Map
Maps YOLOv8 & computer vision classes to official 4-stream recycling categories and bin colors.
Compatible with standard COCO models and custom waste datasets.
"""

CATEGORY_RECYCLABLE = 'recyclable'
CATEGORY_REUSABLE = 'reusable'
CATEGORY_BIODEGRADABLE = 'biodegradable'
CATEGORY_HAZARDOUS = 'hazardous'
CATEGORY_UNCLASSIFIED = 'unclassified'

BIN_BLUE = 'blue'
BIN_GREEN = 'green'
BIN_BROWN = 'brown'
BIN_RED = 'red'
BIN_SLATE = 'slate'

CLASS_MAP = {
    # 1. RECYCLABLE (Blue Bin)
    'bottle': {
        'category': CATEGORY_RECYCLABLE,
        'bin': BIN_BLUE,
        'material': 'PET #1 Polyethylene / Glass',
        'decomposition': '450 years',
        'instructions': 'Empty liquids, crush to save space, and place in Blue bin.',
        'points': 15,
        'co2_saved_kg': 1.2
    },
    'wine glass': {
        'category': CATEGORY_RECYCLABLE,
        'bin': BIN_BLUE,
        'material': 'Flint / Soda-Lime Glass',
        'decomposition': '1,000,000+ years',
        'instructions': 'Rinse thoroughly and place in Blue glass/recyclable bin.',
        'points': 15,
        'co2_saved_kg': 0.9
    },
    'can': {
        'category': CATEGORY_RECYCLABLE,
        'bin': BIN_BLUE,
        'material': 'Aluminum 3004 Alloy',
        'decomposition': '200 to 500 years',
        'instructions': 'Infinitely recyclable aluminum. Drop into Blue recycling bin.',
        'points': 15,
        'co2_saved_kg': 1.8
    },
    'tin can': {
        'category': CATEGORY_RECYCLABLE,
        'bin': BIN_BLUE,
        'material': 'Tinplate Steel',
        'decomposition': '50 to 100 years',
        'instructions': 'Rinse food residue, put in Blue recycling bin.',
        'points': 15,
        'co2_saved_kg': 1.4
    },
    'box': {
        'category': CATEGORY_RECYCLABLE,
        'bin': BIN_BLUE,
        'material': 'Corrugated Paperboard Fiber',
        'decomposition': '2 months (if clean)',
        'instructions': 'Flatten cardboard box and place in Blue paper/cardboard bin.',
        'points': 15,
        'co2_saved_kg': 0.8
    },
    'book': {
        'category': CATEGORY_RECYCLABLE,
        'bin': BIN_BLUE,
        'material': 'Kraft Wood Pulp Paper',
        'decomposition': '2 to 6 months',
        'instructions': 'Place in Blue recycling or donate to campus book exchange.',
        'points': 15,
        'co2_saved_kg': 0.7
    },
    'newspaper': {
        'category': CATEGORY_RECYCLABLE,
        'bin': BIN_BLUE,
        'material': 'De-inkable Cellulose Newsprint',
        'decomposition': '6 weeks',
        'instructions': 'Bundle dry newsprint into the Blue paper bin.',
        'points': 15,
        'co2_saved_kg': 0.6
    },

    # 2. REUSABLE (Green Bin / Exchange Locker)
    'cup': {
        'category': CATEGORY_REUSABLE,
        'bin': BIN_GREEN,
        'material': 'Stainless Steel / Ceramic / Reusable Tumbler',
        'decomposition': 'Durable multi-year asset (>1,000 uses)',
        'instructions': 'Wash at refill station or return to Green reusable exchange box.',
        'points': 20,
        'co2_saved_kg': 2.4
    },
    'bowl': {
        'category': CATEGORY_REUSABLE,
        'bin': BIN_GREEN,
        'material': 'Durable Food Ware / Melamine / Ceramic',
        'decomposition': 'Permanent reusable tableware',
        'instructions': 'Wash and keep using! Return to green food-hall pickup station.',
        'points': 20,
        'co2_saved_kg': 2.0
    },
    'bag': {
        'category': CATEGORY_REUSABLE,
        'bin': BIN_GREEN,
        'material': 'Woven Cotton / Polypropylene Tote',
        'decomposition': 'Reusable multi-trip shopping bag',
        'instructions': 'Fold and reuse! Never throw in single-use bins.',
        'points': 15,
        'co2_saved_kg': 1.5
    },
    'handbag': {
        'category': CATEGORY_REUSABLE,
        'bin': BIN_GREEN,
        'material': 'Textile / Canvas Reusable',
        'decomposition': 'Long-term reusable garment',
        'instructions': 'Reuse or donate to campus textile exchange locker.',
        'points': 20,
        'co2_saved_kg': 3.0
    },
    'fork': {
        'category': CATEGORY_REUSABLE,
        'bin': BIN_GREEN,
        'material': 'Stainless Steel Cutlery',
        'decomposition': 'Permanent utensil',
        'instructions': 'Place in Green dishwashing tray for cleaning and reuse.',
        'points': 10,
        'co2_saved_kg': 0.5
    },
    'spoon': {
        'category': CATEGORY_REUSABLE,
        'bin': BIN_GREEN,
        'material': 'Stainless Steel Cutlery',
        'decomposition': 'Permanent utensil',
        'instructions': 'Place in Green dishwashing tray for cleaning and reuse.',
        'points': 10,
        'co2_saved_kg': 0.5
    },

    # 3. BIODEGRADABLE (Brown Bin / Compost)
    'banana': {
        'category': CATEGORY_BIODEGRADABLE,
        'bin': BIN_BROWN,
        'material': 'Organic Cellulose Biomass',
        'decomposition': '2 to 4 weeks',
        'instructions': 'Drop in Brown compost bin. Produces rich agricultural compost.',
        'points': 15,
        'co2_saved_kg': 0.8
    },
    'apple': {
        'category': CATEGORY_BIODEGRADABLE,
        'bin': BIN_BROWN,
        'material': 'Organic Pectin & Cellulose Fiber',
        'decomposition': '2 months',
        'instructions': 'Drop core in Brown organic bin. Diverts methane from open dumps.',
        'points': 15,
        'co2_saved_kg': 0.7
    },
    'orange': {
        'category': CATEGORY_BIODEGRADABLE,
        'bin': BIN_BROWN,
        'material': 'Organic Citrus Peel',
        'decomposition': '6 months',
        'instructions': 'Place in Brown compost bin for aerobic breakdown.',
        'points': 15,
        'co2_saved_kg': 0.6
    },
    'pizza': {
        'category': CATEGORY_BIODEGRADABLE,
        'bin': BIN_BROWN,
        'material': 'Grease-Soaked Cardboard & Food Waste',
        'decomposition': '2 to 3 months',
        'instructions': 'FOOD GREASE CONTAMINATES BLUE BIN! Place greasy pizza box in Brown compost.',
        'points': 15,
        'co2_saved_kg': 1.1
    },
    'sandwich': {
        'category': CATEGORY_BIODEGRADABLE,
        'bin': BIN_BROWN,
        'material': 'Organic Food Scraps',
        'decomposition': '1 to 2 weeks',
        'instructions': 'Drop leftovers into Brown compost bin.',
        'points': 15,
        'co2_saved_kg': 0.9
    },

    # 4. HAZARDOUS (Red Bin / E-Waste)
    'cell phone': {
        'category': CATEGORY_HAZARDOUS,
        'bin': BIN_RED,
        'material': 'Lithium-Ion / Heavy Metals & Rare Earths',
        'decomposition': 'Never decomposes · Dangerous chemical & fire hazard',
        'instructions': 'DANGER: Place only into the Red fire-retardant battery/e-waste receptacle.',
        'points': 25,
        'co2_saved_kg': 4.5
    },
    'phone': {
        'category': CATEGORY_HAZARDOUS,
        'bin': BIN_RED,
        'material': 'Lithium-Ion Battery / Micro-electronics',
        'decomposition': 'Never decomposes · Severe soil toxic hazard',
        'instructions': 'Deposit strictly into the Red hazardous e-waste station.',
        'points': 25,
        'co2_saved_kg': 4.5
    },
    'laptop': {
        'category': CATEGORY_HAZARDOUS,
        'bin': BIN_RED,
        'material': 'Printed Circuit Boards / Li-Polymer Cells',
        'decomposition': 'Contains Lead, Cadmium, and Beryllium',
        'instructions': 'Hand over to Red electronic waste station for certified e-waste dismantling.',
        'points': 30,
        'co2_saved_kg': 8.0
    },
    'keyboard': {
        'category': CATEGORY_HAZARDOUS,
        'bin': BIN_RED,
        'material': 'Electronic Switches / Copper Wiring / ABS Plastic',
        'decomposition': 'Requires specialist electronic recycling',
        'instructions': 'Place in Red E-Waste bin. Do not mix with regular plastic recycling.',
        'points': 20,
        'co2_saved_kg': 2.5
    },
    'mouse': {
        'category': CATEGORY_HAZARDOUS,
        'bin': BIN_RED,
        'material': 'Electronic Optical Sensor & PCB E-Waste',
        'decomposition': 'Electronic hazardous waste',
        'instructions': 'Place in Red E-Waste bin.',
        'points': 20,
        'co2_saved_kg': 1.8
    },
    'battery': {
        'category': CATEGORY_HAZARDOUS,
        'bin': BIN_RED,
        'material': 'Lithium / Nickel-Cadmium / Alkaline Cells',
        'decomposition': 'Corrosive chemical acid & explosion hazard',
        'instructions': 'FIRE HAZARD: Tape terminals and drop into Red battery tube.',
        'points': 25,
        'co2_saved_kg': 3.5
    }
}

def get_class_info(class_name: str, *, visual_detection: bool = False) -> dict:
    """Return stream category, bin color, and handling instructions for any class."""
    norm = class_name.strip().lower()
    if visual_detection and norm in {'cup', 'bowl'}:
        return {
            'category': CATEGORY_UNCLASSIFIED,
            'bin': BIN_SLATE,
            'material': 'Cup or bowl; reusable status cannot be confirmed visually',
            'decomposition': 'Undetermined',
            'instructions': 'Reusable status is uncertain. Verify the item before sorting.',
            'points': 10,
            'co2_saved_kg': 0.0
        }

    if norm in CLASS_MAP:
        return CLASS_MAP[norm]
    
    # Priority keyword matching for composite labels
    # 1. Hazardous checks first
    if any(k in norm for k in ['battery', 'phone', 'laptop', 'circuit', 'keyboard', 'mouse', 'e-waste', 'charger']):
        for k in ['battery', 'phone', 'cell phone', 'laptop', 'keyboard', 'mouse']:
            if k in norm:
                return CLASS_MAP[k]
        return CLASS_MAP['battery']

    # 2. Food & grease checks (greasy pizza box goes to compost!)
    if any(k in norm for k in ['pizza', 'banana', 'apple', 'orange', 'peel', 'food', 'sandwich', 'scrap']):
        for k in ['pizza', 'banana', 'apple', 'orange', 'sandwich']:
            if k in norm:
                return CLASS_MAP[k]
        return CLASS_MAP['banana']

    # 3. Reusable checks (tote bag, cup, tumbler, mug)
    if any(k in norm for k in ['tote', 'bag', 'handbag', 'tumbler', 'cup', 'mug', 'bowl', 'fork', 'spoon']):
        for k in ['handbag', 'bag', 'cup', 'bowl', 'fork', 'spoon']:
            if k in norm:
                return CLASS_MAP[k]
        return CLASS_MAP['cup']

    # 4. Recyclable checks (bottle, can, glass, box, newspaper)
    if any(k in norm for k in ['bottle', 'can', 'tin', 'glass', 'box', 'cardboard', 'paper', 'newspaper', 'book']):
        for k in ['bottle', 'wine glass', 'can', 'box', 'newspaper', 'book']:
            if k in norm:
                return CLASS_MAP[k]
        return CLASS_MAP['bottle']

    # Default to Unclassified for volunteer review
    return {
        'category': CATEGORY_UNCLASSIFIED,
        'bin': BIN_SLATE,
        'material': 'Unclassified / Composite Material',
        'decomposition': 'Undetermined',
        'instructions': 'Unrecognized material. Flagged for volunteer inspection.',
        'points': 10,
        'co2_saved_kg': 0.0
    }
