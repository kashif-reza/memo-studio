import React from 'react';

export type AuraEmotionId =
  | 'disgust'
  | 'ennui'
  | 'anger'
  | 'anxiety'
  | 'joy'
  | 'sadness'
  | 'fear'
  | 'envy'
  | 'embarrassing';

export interface AuraEmotionSpec {
  id: AuraEmotionId;
  label: string;
  coreColor: string;
  edgeColor: string;
  textColor: string;
  tagline: string;
  motionClass: string;
}

export const AURA_EMOTIONS: AuraEmotionSpec[] = [
  {
    id: 'disgust',
    label: 'Disgust',
    coreColor: '#56C883',
    edgeColor: '#A9E8BF',
    textColor: '#1E6F43',
    tagline: 'Side-eye skeptic',
    motionClass: 'animate-[pulse_3.2s_ease-in-out_infinite]',
  },
  {
    id: 'ennui',
    label: 'Ennui',
    coreColor: '#7E87D6',
    edgeColor: '#B8BEEF',
    textColor: '#373E88',
    tagline: 'Effortlessly unbothered',
    motionClass: 'animate-[pulse_4s_ease-in-out_infinite]',
  },
  {
    id: 'anger',
    label: 'Anger',
    coreColor: '#D65A52',
    edgeColor: '#F09D97',
    textColor: '#7F1D18',
    tagline: 'Ready to erupt',
    motionClass: 'animate-[pulse_2.1s_ease-in-out_infinite]',
  },
  {
    id: 'anxiety',
    label: 'Anxiety',
    coreColor: '#EE9B59',
    edgeColor: '#F9C9A0',
    textColor: '#934814',
    tagline: 'Overthinking everything',
    motionClass: 'animate-[pulse_2.4s_ease-in-out_infinite]',
  },
  {
    id: 'joy',
    label: 'Joy',
    coreColor: '#F8CE58',
    edgeColor: '#FCE59B',
    textColor: '#9C710B',
    tagline: 'Radiant optimism',
    motionClass: 'animate-[pulse_2.8s_ease-in-out_infinite]',
  },
  {
    id: 'sadness',
    label: 'Sadness',
    coreColor: '#72C2FB',
    edgeColor: '#B7E2FE',
    textColor: '#1D689E',
    tagline: 'Soft blue melancholy',
    motionClass: 'animate-[pulse_3.8s_ease-in-out_infinite]',
  },
  {
    id: 'fear',
    label: 'Fear',
    coreColor: '#DCC4EA',
    edgeColor: '#EFE1F7',
    textColor: '#6D4E82',
    tagline: 'Trembling alert',
    motionClass: 'animate-[pulse_2.3s_ease-in-out_infinite]',
  },
  {
    id: 'envy',
    label: 'Envy',
    coreColor: '#4BAFD9',
    edgeColor: '#9BD5EE',
    textColor: '#165D7D',
    tagline: 'Starry-eyed admiration',
    motionClass: 'animate-[pulse_2.9s_ease-in-out_infinite]',
  },
  {
    id: 'embarrassing',
    label: 'Embarrassing',
    coreColor: '#E574B0',
    edgeColor: '#F5B5D6',
    textColor: '#8B265C',
    tagline: 'Blushing shyness',
    motionClass: 'animate-[pulse_3.4s_ease-in-out_infinite]',
  },
];

export type EmojisanCharacterId =
  | 'starsan'
  | 'ellipsan'
  | 'cloudsan'
  | 'conesan'
  | 'heartsan'
  | 'boltsan';

export interface EmojisanCharacterSpec {
  id: EmojisanCharacterId;
  name: string;
  tagline: string;
  cardBg: string;
  cardHoverBg: string;
  description: string;
  targetStudio: 'emoji-studio' | 'gif-studio' | 'meme-maker' | 'text-to-emoji';
  studioName: string;
}

export const DEFAULT_EMOJISAN_CHARACTERS: EmojisanCharacterSpec[] = [
  {
    id: 'starsan',
    name: 'Starsan',
    tagline: "He's a loyal friend",
    cardBg: '#B85CFF',
    cardHoverBg: '#a744f5',
    description:
      'Choose an emoji and it will remind you of all the things that you have planned — or launch Emoji Studio to mix custom stickers.',
    targetStudio: 'emoji-studio',
    studioName: 'Emoji Studio',
  },
  {
    id: 'ellipsan',
    name: 'Ellipsan',
    tagline: "He's a reliable friend",
    cardBg: '#FF2A7A',
    cardHoverBg: '#e81b69',
    description:
      'Ellipsan turns your favorite reaction sequences and headlines into smooth looping animated GIFs in seconds.',
    targetStudio: 'gif-studio',
    studioName: 'GIF Studio',
  },
  {
    id: 'cloudsan',
    name: 'Cloudsan',
    tagline: "He's a fun friend",
    cardBg: '#2BC4F3',
    cardHoverBg: '#17b2e2',
    description:
      'Cloudsan helps you craft viral memes from 139+ templates or your own uploaded photos with bold draggable captions.',
    targetStudio: 'meme-maker',
    studioName: 'Meme Maker',
  },
  {
    id: 'conesan',
    name: 'Conesan',
    tagline: "He's a smart friend",
    cardBg: '#C8EA2B',
    cardHoverBg: '#b8da1b',
    description:
      'Conesan enriches plain messages with expressive, non-overlapping emojis tailored to your exact mood.',
    targetStudio: 'text-to-emoji',
    studioName: 'Text to Emoji',
  },
];

export const EXTRA_EMOJISAN_CHARACTERS: EmojisanCharacterSpec[] = [
  {
    id: 'heartsan',
    name: 'Heartsan',
    tagline: "She's a warm friend",
    cardBg: '#FF5E5B',
    cardHoverBg: '#ee4946',
    description:
      'Heartsan curates your sweetest reaction stickers, love memes, and expressive mood avatars.',
    targetStudio: 'emoji-studio',
    studioName: 'Emoji Studio',
  },
  {
    id: 'boltsan',
    name: 'Boltsan',
    tagline: "He's a hyper friend",
    cardBg: '#FFB800',
    cardHoverBg: '#e6a600',
    description:
      'Boltsan supercharges your kinetic text GIFs and high-energy reaction templates.',
    targetStudio: 'gif-studio',
    studioName: 'GIF Studio',
  },
];

interface AuraEmotionOrbSvgProps {
  emotion: AuraEmotionSpec;
  size?: number;
  animated?: boolean;
  customLabel?: string;
}

/**
 * Renders the Inside-Out style soft blurred glowing Aura Emotion Avatar (First Reference Image).
 */
export const AuraEmotionOrbSvg: React.FC<AuraEmotionOrbSvgProps> = ({
  emotion,
  size = 150,
  animated = true,
  customLabel,
}) => {
  const filterId = `aura-blur-${emotion.id}`;
  const gradId = `aura-grad-${emotion.id}`;
  const displayLabel = customLabel ?? emotion.label;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="select-none overflow-visible"
      role="img"
      aria-label={`${displayLabel} aura avatar`}
    >
      <defs>
        <radialGradient id={gradId} cx="50%" cy="44%" r="48%" fx="46%" fy="36%">
          <stop offset="0%" stopColor={emotion.edgeColor} stopOpacity="1" />
          <stop offset="55%" stopColor={emotion.coreColor} stopOpacity="0.96" />
          <stop offset="85%" stopColor={emotion.coreColor} stopOpacity="0.68" />
          <stop offset="100%" stopColor={emotion.coreColor} stopOpacity="0" />
        </radialGradient>
        <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* Outer Soft Diffused Aura Halo */}
      <circle
        cx="100"
        cy="102"
        r="78"
        fill={`url(#${gradId})`}
        filter={`url(#${filterId})`}
        className={animated ? 'origin-center transition-transform duration-700' : ''}
      />

      {/* Inner Glowing Sphere Core */}
      <circle cx="100" cy="98" r="66" fill={`url(#${gradId})`} />

      {/* Subtle Top Highlight */}
      <ellipse cx="94" cy="54" rx="34" ry="15" fill="#FFFFFF" fillOpacity="0.32" />

      {/* Expressive Minimalist Face (Positioned at Upper Third like Reference Image 1) */}
      <g
        className={
          animated
            ? 'transition-transform duration-500 group-hover:translate-y-[-2px] group-hover:scale-105 origin-center'
            : ''
        }
      >
        {emotion.id === 'disgust' && (
          <g>
            {/* Left & Right Skeptical Arched Half-Moon Eyes */}
            <path d="M72 62 C75 51, 88 51, 90 61 Z" fill="#0B0B0B" />
            <path d="M104 61 C106 51, 119 51, 122 62 Z" fill="#0B0B0B" />
            {/* Sideways Skeptical Slanted Mouth */}
            <path
              d="M76 76 Q92 69 110 71"
              stroke="#0B0B0B"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          </g>
        )}

        {emotion.id === 'ennui' && (
          <g>
            {/* Half-Lidded Bored Eyes */}
            <path d="M72 58 H91 C91 65, 72 65, 72 58 Z" fill="#0B0B0B" />
            <path d="M106 58 H125 C125 65, 106 65, 106 58 Z" fill="#0B0B0B" />
            {/* Small Unbothered Tilted Mouth */}
            <path
              d="M86 76 Q99 71 112 74"
              stroke="#0B0B0B"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          </g>
        )}

        {emotion.id === 'anger' && (
          <g>
            {/* Furrowed Angry V-Shaped Eyes */}
            <path d="M70 53 L92 60 C90 68, 72 67, 70 53 Z" fill="#0B0B0B" />
            <path d="M128 53 L106 60 C108 68, 126 67, 128 53 Z" fill="#0B0B0B" />
            {/* Downturned Scowl */}
            <path
              d="M80 77 Q99 68 118 77"
              stroke="#0B0B0B"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>
        )}

        {emotion.id === 'anxiety' && (
          <g>
            {/* Wide Worried Rounded Eyes */}
            <path d="M73 62 C73 49, 92 49, 92 62 Z" fill="#0B0B0B" />
            <path d="M105 62 C105 49, 124 49, 124 62 Z" fill="#0B0B0B" />
            {/* Wide Tense Grimace Line */}
            <path
              d="M62 75 Q99 67 135 75"
              stroke="#0B0B0B"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>
        )}

        {emotion.id === 'joy' && (
          <g>
            {/* Cheerful Rounded Eyes */}
            <path d="M76 61 C76 49, 93 49, 93 61 Z" fill="#0B0B0B" />
            <path d="M107 61 C107 49, 124 49, 124 61 Z" fill="#0B0B0B" />
            {/* Big Warm Happy Smile */}
            <path
              d="M74 69 Q100 84 126 69"
              stroke="#0B0B0B"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
          </g>
        )}

        {emotion.id === 'sadness' && (
          <g>
            {/* Sad Drooping Eyes */}
            <path d="M73 61 C76 50, 92 52, 94 60 Z" fill="#0B0B0B" />
            <path d="M127 61 C124 50, 108 52, 106 60 Z" fill="#0B0B0B" />
            {/* Sad Frown */}
            <path
              d="M84 76 Q100 68 116 76"
              stroke="#0B0B0B"
              strokeWidth="4.8"
              strokeLinecap="round"
            />
          </g>
        )}

        {emotion.id === 'fear' && (
          <g>
            {/* Pinched Nervous Eyes */}
            <path d="M74 56 C78 46, 92 50, 94 58 Z" fill="#0B0B0B" />
            <path d="M124 56 C120 46, 106 50, 104 58 Z" fill="#0B0B0B" />
            {/* Wavy Trembling Mouth */}
            <path
              d="M78 70 Q84 64 90 70 T102 70 T114 70 T122 70"
              stroke="#0B0B0B"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}

        {emotion.id === 'envy' && (
          <g>
            {/* Big Starry Sparkling Eyes */}
            <ellipse cx="83" cy="60" rx="11" ry="9.5" fill="#0B0B0B" />
            <ellipse cx="116" cy="60" rx="11" ry="9.5" fill="#0B0B0B" />
            {/* 4-Point White Sparkles Inside Eyes */}
            <path
              d="M86 52 L87.5 56.5 L92 58 L87.5 59.5 L86 64 L84.5 59.5 L80 58 L84.5 56.5 Z"
              fill="#FFFFFF"
            />
            <path
              d="M119 52 L120.5 56.5 L125 58 L120.5 59.5 L119 64 L117.5 59.5 L113 58 L117.5 56.5 Z"
              fill="#FFFFFF"
            />
            {/* Cute Side Smirk */}
            <path
              d="M75 76 Q83 83 92 76"
              stroke="#0B0B0B"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          </g>
        )}

        {emotion.id === 'embarrassing' && (
          <g>
            {/* Shy Down-Curved Blush Eyes (No Mouth, Tucked in Blush) */}
            <path d="M68 62 C70 48, 88 49, 92 63 C84 60, 75 60, 68 62 Z" fill="#0B0B0B" />
            <path d="M132 62 C130 48, 112 49, 108 63 C116 60, 125 60, 132 62 Z" fill="#0B0B0B" />
            {/* Rosy Cheek Glows */}
            <ellipse cx="68" cy="74" rx="11" ry="6" fill="#C93B84" fillOpacity="0.45" />
            <ellipse cx="132" cy="74" rx="11" ry="6" fill="#C93B84" fillOpacity="0.45" />
          </g>
        )}
      </g>

      {/* Emotion Title Centered Inside the Lower Half of the Aura Sphere */}
      <text
        x="100"
        y="122"
        textAnchor="middle"
        fill={emotion.textColor}
        fontSize="14.5"
        fontWeight="600"
        fontFamily="Plus Jakarta Sans, sans-serif"
        style={{ letterSpacing: '-0.01em' }}
      >
        {displayLabel}
      </text>
    </svg>
  );
};

interface Emojisan3DCharacterSvgProps {
  characterId: EmojisanCharacterId;
  size?: number;
}

/**
 * Renders the 3D-shaded glossy Emojisan characters from the Second Reference Image
 * (Starsan purple star, Ellipsan pink oval, Cloudsan cyan cloud, Conesan lime cone).
 */
export const Emojisan3DCharacterSvg: React.FC<Emojisan3DCharacterSvgProps> = ({
  characterId,
  size = 160,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="select-none drop-shadow-[0_14px_20px_rgba(0,0,0,0.22)] transition-transform duration-300 group-hover:scale-105"
      role="img"
      aria-label={`${characterId} 3D character`}
    >
      <defs>
        {/* Starsan 3D Purple Gradient */}
        <radialGradient id="starsan-grad" cx="42%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#F0C8FF" />
          <stop offset="38%" stopColor="#C86BFA" />
          <stop offset="78%" stopColor="#9B3EE0" />
          <stop offset="100%" stopColor="#721EB5" />
        </radialGradient>

        {/* Ellipsan 3D Hot Pink Gradient */}
        <radialGradient id="ellipsan-grad" cx="38%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#FFB0D0" />
          <stop offset="35%" stopColor="#FF3D8B" />
          <stop offset="78%" stopColor="#E01266" />
          <stop offset="100%" stopColor="#A50848" />
        </radialGradient>

        {/* Cloudsan 3D Sky Cyan Gradient */}
        <radialGradient id="cloudsan-grad" cx="40%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#B8F1FF" />
          <stop offset="40%" stopColor="#42CCF8" />
          <stop offset="80%" stopColor="#1499CC" />
          <stop offset="100%" stopColor="#0C6B94" />
        </radialGradient>

        {/* Conesan 3D Lime Chartreuse Gradient */}
        <radialGradient id="conesan-grad" cx="38%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#F6FF9E" />
          <stop offset="42%" stopColor="#D4F238" />
          <stop offset="82%" stopColor="#A3C610" />
          <stop offset="100%" stopColor="#759106" />
        </radialGradient>

        {/* Heartsan 3D Coral Gradient */}
        <radialGradient id="heartsan-grad" cx="38%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#FFC2C0" />
          <stop offset="40%" stopColor="#FF5E5B" />
          <stop offset="85%" stopColor="#D62828" />
          <stop offset="100%" stopColor="#9E1414" />
        </radialGradient>

        {/* Boltsan 3D Golden Gradient */}
        <radialGradient id="boltsan-grad" cx="38%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#FFF0A8" />
          <stop offset="40%" stopColor="#FFC71F" />
          <stop offset="85%" stopColor="#E08E00" />
          <stop offset="100%" stopColor="#A66300" />
        </radialGradient>
      </defs>

      {characterId === 'starsan' && (
        <g>
          {/* Rounded 3D Puffy 5-Point Star Body */}
          <path
            d="M110 22 C118 22, 134 56, 142 62 C150 68, 188 72, 192 82 C196 92, 168 120, 166 130 C164 140, 174 178, 166 184 C158 190, 122 172, 110 172 C98 172, 62 190, 54 184 C46 178, 56 140, 54 130 C52 120, 24 92, 28 82 C32 72, 70 68, 78 62 C86 56, 102 22, 110 22 Z"
            fill="url(#starsan-grad)"
          />
          {/* 3D Specular Ridge Shine */}
          <ellipse
            cx="96"
            cy="64"
            rx="18"
            ry="32"
            transform="rotate(-18 96 64)"
            fill="#FFFFFF"
            fillOpacity="0.28"
          />
          {/* Cute Glossy Eyes */}
          <circle cx="84" cy="112" r="12" fill="#231F20" />
          <circle cx="88" cy="108" r="4.5" fill="#FFFFFF" />
          <circle cx="136" cy="112" r="12" fill="#231F20" />
          <circle cx="140" cy="108" r="4.5" fill="#FFFFFF" />
          {/* Soft Purple-Plum Cheek Blushes */}
          <circle cx="66" cy="128" r="13" fill="#7C29B8" fillOpacity="0.55" />
          <circle cx="154" cy="128" r="13" fill="#7C29B8" fillOpacity="0.55" />
          {/* Friendly Tilted Smile */}
          <path
            d="M103 128 Q112 133 120 125"
            stroke="#231F20"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
      )}

      {characterId === 'ellipsan' && (
        <g>
          {/* Glossy 3D Puffy Pink Elliptical Cushion */}
          <ellipse cx="110" cy="114" rx="76" ry="62" fill="url(#ellipsan-grad)" />
          {/* Rim Highlight */}
          <ellipse cx="92" cy="76" rx="44" ry="18" fill="#FFFFFF" fillOpacity="0.32" />
          {/* Cute Glossy Eyes */}
          <circle cx="80" cy="108" r="11.5" fill="#231F20" />
          <circle cx="83.5" cy="104.5" r="4" fill="#FFFFFF" />
          <circle cx="140" cy="108" r="11.5" fill="#231F20" />
          <circle cx="143.5" cy="104.5" r="4" fill="#FFFFFF" />
          {/* Deep Berry Cheek Blushes */}
          <circle cx="62" cy="126" r="14" fill="#9E0B4A" fillOpacity="0.55" />
          <circle cx="158" cy="126" r="14" fill="#9E0B4A" fillOpacity="0.55" />
          {/* Cute Tiny Smile */}
          <path
            d="M104 117 Q110 123 116 117"
            stroke="#231F20"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </g>
      )}

      {characterId === 'cloudsan' && (
        <g>
          {/* 3D Puffy Polygon Cloud */}
          <path
            d="M66 64 C84 48, 136 48, 154 64 C178 74, 186 112, 172 138 C160 162, 132 172, 110 172 C88 172, 60 162, 48 138 C34 112, 42 74, 66 64 Z"
            fill="url(#cloudsan-grad)"
          />
          {/* Top Facet Specular Highlight */}
          <ellipse cx="105" cy="78" rx="42" ry="16" fill="#FFFFFF" fillOpacity="0.34" />
          {/* Cute Low-Set Eyes */}
          <circle cx="86" cy="124" r="10.5" fill="#1B2A38" />
          <circle cx="89" cy="121" r="3.8" fill="#FFFFFF" />
          <circle cx="134" cy="124" r="10.5" fill="#1B2A38" />
          <circle cx="137" cy="121" r="3.8" fill="#FFFFFF" />
          {/* Deep Teal Cheek Blushes */}
          <ellipse cx="64" cy="136" rx="14" ry="11" fill="#0E6B91" fillOpacity="0.55" />
          <ellipse cx="156" cy="136" rx="14" ry="11" fill="#0E6B91" fillOpacity="0.55" />
          {/* Happy Open Pink Tongue Mouth */}
          <path
            d="M102 133 H118 C118 146, 102 146, 102 133 Z"
            fill="#FF7096"
            stroke="#1B2A38"
            strokeWidth="3.5"
          />
        </g>
      )}

      {characterId === 'conesan' && (
        <g>
          {/* 3D Rounded Lime Cone */}
          <path
            d="M110 26 C120 26, 168 128, 170 150 C172 174, 144 188, 110 188 C76 188, 48 174, 50 150 C52 128, 100 26, 110 26 Z"
            fill="url(#conesan-grad)"
          />
          {/* Left Vertical Specular Highlight */}
          <path
            d="M106 44 C101 76, 82 132, 78 162"
            stroke="#FFFFFF"
            strokeWidth="12"
            strokeLinecap="round"
            strokeOpacity="0.35"
          />
          {/* Expressive Tilted Eyes */}
          <ellipse
            cx="102"
            cy="112"
            rx="8.5"
            ry="11"
            transform="rotate(10 102 112)"
            fill="#1E2410"
          />
          <circle cx="104" cy="108" r="3.2" fill="#FFFFFF" />
          <ellipse
            cx="138"
            cy="124"
            rx="8.5"
            ry="11"
            transform="rotate(10 138 124)"
            fill="#1E2410"
          />
          <circle cx="140" cy="120" r="3.2" fill="#FFFFFF" />
          {/* Olive Cheek Blushes */}
          <circle cx="84" cy="128" r="11" fill="#89A80D" fillOpacity="0.6" />
          <circle cx="150" cy="144" r="10" fill="#89A80D" fillOpacity="0.6" />
          {/* Surprised Cute 'O' Mouth */}
          <ellipse
            cx="120"
            cy="138"
            rx="7.5"
            ry="9.5"
            fill="#FF85A1"
            stroke="#1E2410"
            strokeWidth="3.8"
          />
        </g>
      )}

      {characterId === 'heartsan' && (
        <g>
          <path
            d="M110 178 C110 178, 36 132, 36 78 C36 50, 60 34, 84 34 C98 34, 106 44, 110 52 C114 44, 122 34, 136 34 C160 34, 184 50, 184 78 C184 132, 110 178, 110 178 Z"
            fill="url(#heartsan-grad)"
          />
          <circle cx="85" cy="96" r="10.5" fill="#231F20" />
          <circle cx="88" cy="93" r="3.8" fill="#FFFFFF" />
          <circle cx="135" cy="96" r="10.5" fill="#231F20" />
          <circle cx="138" cy="93" r="3.8" fill="#FFFFFF" />
          <path
            d="M100 112 Q110 122 120 112"
            stroke="#231F20"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </g>
      )}

      {characterId === 'boltsan' && (
        <g>
          <circle cx="110" cy="112" r="70" fill="url(#boltsan-grad)" />
          <ellipse cx="92" cy="68" rx="36" ry="15" fill="#FFFFFF" fillOpacity="0.35" />
          <circle cx="84" cy="106" r="11" fill="#231F20" />
          <circle cx="88" cy="102" r="4" fill="#FFFFFF" />
          <circle cx="136" cy="106" r="11" fill="#231F20" />
          <circle cx="140" cy="102" r="4" fill="#FFFFFF" />
          <circle cx="64" cy="122" r="12" fill="#D97706" fillOpacity="0.5" />
          <circle cx="156" cy="122" r="12" fill="#D97706" fillOpacity="0.5" />
          <path
            d="M96 122 Q110 136 124 122"
            stroke="#231F20"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
};

/**
 * Renders an AuraEmotionSpec onto an HTML5 Canvas and returns a PNG Data URL
 * so users can download, copy to clipboard, or open any Aura Emotion Avatar in Meme Maker / GIF Studio.
 */
export function renderAuraEmotionToDataUrl(
  emotion: AuraEmotionSpec,
  customLabel?: string
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 500;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Clean white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 500, 500);

  // Soft radial aura gradient
  const grad = ctx.createRadialGradient(240, 220, 20, 250, 250, 200);
  grad.addColorStop(0, emotion.edgeColor);
  grad.addColorStop(0.55, emotion.coreColor);
  grad.addColorStop(0.85, emotion.coreColor + 'AA');
  grad.addColorStop(1, '#FFFFFF00');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(250, 250, 205, 0, Math.PI * 2);
  ctx.fill();

  // Simple expressive eyes & mouth on canvas
  ctx.fillStyle = '#0B0B0B';
  ctx.strokeStyle = '#0B0B0B';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';

  // Left & Right Eyes
  ctx.beginPath();
  ctx.arc(210, 155, 22, Math.PI, 0, false);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(290, 155, 22, Math.PI, 0, false);
  ctx.fill();

  // Mouth based on emotion
  ctx.beginPath();
  if (emotion.id === 'joy' || emotion.id === 'envy') {
    ctx.arc(250, 175, 42, 0.15 * Math.PI, 0.85 * Math.PI, false);
    ctx.stroke();
  } else if (emotion.id === 'embarrassing') {
    ctx.fillStyle = 'rgba(201,59,132,0.45)';
    ctx.beginPath();
    ctx.ellipse(175, 185, 26, 14, 0, 0, Math.PI * 2);
    ctx.ellipse(325, 185, 26, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.moveTo(200, 195);
    ctx.quadraticCurveTo(250, 175, 300, 195);
    ctx.stroke();
  }

  // Label
  ctx.fillStyle = emotion.textColor;
  ctx.font = '600 34px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(customLabel ?? emotion.label, 250, 305);

  return canvas.toDataURL('image/png');
}
