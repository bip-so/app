import React from "react";

const DiscordIcon = ({ size, color, fill }) => (
  <svg
    width={size || "24"}
    height={size || "24"}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="12" fill={fill || "#5865F2"} />
    <g clipPath="url(#clip0_2353_68532)">
      <path
        d="M16.8516 7.96563C15.9593 7.5562 15.0024 7.25455 14.0019 7.08178C13.9837 7.07845 13.9655 7.08678 13.9561 7.10344C13.8331 7.32232 13.6968 7.60786 13.6013 7.83229C12.5252 7.6712 11.4547 7.6712 10.4007 7.83229C10.3052 7.60287 10.1639 7.32232 10.0403 7.10344C10.0309 7.08733 10.0127 7.079 9.99453 7.08178C8.99461 7.254 8.03774 7.55565 7.14488 7.96563C7.13715 7.96896 7.13052 7.97452 7.12613 7.98174C5.31115 10.6933 4.81395 13.3382 5.05786 15.9503C5.05896 15.9631 5.06613 15.9753 5.07607 15.9831C6.27354 16.8625 7.4335 17.3963 8.57191 17.7502C8.59013 17.7558 8.60944 17.7491 8.62103 17.7341C8.89032 17.3663 9.13037 16.9786 9.33619 16.5708C9.34834 16.5469 9.33675 16.5186 9.31192 16.5091C8.93116 16.3647 8.5686 16.1886 8.21984 15.9886C8.19226 15.9725 8.19005 15.933 8.21543 15.9142C8.28882 15.8592 8.36223 15.8019 8.43231 15.7442C8.44499 15.7336 8.46265 15.7314 8.47756 15.7381C10.7687 16.7841 13.2492 16.7841 15.5134 15.7381C15.5283 15.7308 15.546 15.7331 15.5592 15.7436C15.6293 15.8014 15.7027 15.8592 15.7766 15.9142C15.802 15.933 15.8003 15.9725 15.7728 15.9886C15.424 16.1925 15.0614 16.3647 14.6801 16.5086C14.6553 16.518 14.6443 16.5469 14.6564 16.5708C14.8666 16.978 15.1067 17.3658 15.371 17.7335C15.3821 17.7491 15.4019 17.7558 15.4201 17.7502C16.5641 17.3963 17.724 16.8625 18.9215 15.9831C18.932 15.9753 18.9386 15.9636 18.9397 15.9508C19.2316 12.931 18.4508 10.3078 16.8698 7.98229C16.8659 7.97452 16.8593 7.96896 16.8516 7.96563ZM9.67835 14.3598C8.98854 14.3598 8.42016 13.7265 8.42016 12.9487C8.42016 12.171 8.97752 11.5377 9.67835 11.5377C10.3847 11.5377 10.9476 12.1766 10.9365 12.9487C10.9365 13.7265 10.3792 14.3598 9.67835 14.3598ZM14.3303 14.3598C13.6405 14.3598 13.0721 13.7265 13.0721 12.9487C13.0721 12.171 13.6294 11.5377 14.3303 11.5377C15.0366 11.5377 15.5995 12.1766 15.5885 12.9487C15.5885 13.7265 15.0366 14.3598 14.3303 14.3598Z"
        fill={color || "white"}
      />
    </g>
    <defs>
      <clipPath id="clip0_2353_68532">
        <rect
          width="14"
          height="10.8451"
          fill={color || "white"}
          transform="translate(5 7)"
        />
      </clipPath>
    </defs>
  </svg>
);
export default DiscordIcon;
