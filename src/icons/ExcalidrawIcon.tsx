import { useTheme } from "@primer/react";
import React from "react";
import Colors from "../utils/Colors";

const ExcalidrawIcon = ({ height, width, color }) => {
  const { colorMode } = useTheme();

  return (
    <svg
      viewBox="0 0 55 131"
      xmlns="http://www.w3.org/2000/svg"
      fillRule="evenodd"
      clipRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
      height={height}
      width={width}
      fill={
        color
          ? color
          : colorMode === "day"
          ? Colors.gray["400"]
          : Colors.gray["600"]
      }
    >
      <path fill="none" d="M0 0h54.504v130.964H0z" />
      <path
        d="M51.396 25.807c0 .237-.285.474-.617.474-.284 0-1.09 1.328-1.708 2.941-1.897 4.934-20.873 42.46-20.92 41.273 0-.617-.285-1.044-.76-1.044-.664 0-.759.38-.474 2.23.284 2.135.095 2.61-6.642 15.703-3.795 7.448-7.875 15.228-9.06 17.316-1.234 2.182-2.183 4.554-2.278 5.55-.142 1.708.047 1.945 4.175 5.503 2.372 2.088 5.408 4.697 6.736 5.883 5.978 5.455 8.777 7.638 9.536 7.495 1.138-.19 18.739-18.644 18.786-19.687 0-.475-.854-7.686-1.898-16.035-1.802-14.232-3.51-30.884-3.32-32.497.142-.996-.57-6.025-1.092-8.207-.426-1.708-.237-2.42 3.179-10.2 1.992-4.601 4.602-10.247 5.74-12.524 1.091-2.277 2.04-4.27 2.04-4.412 0-.142-.332-.237-.711-.237-.38 0-.712.19-.712.475zM40.485 61.244c.522 3.321 1.565 11.291 2.324 17.696 1.47 11.765 3.179 24.81 3.653 28.132.285 1.66.095 1.992-2.989 5.408-5.36 6.025-11.053 11.955-12.998 13.473l-1.803 1.423-9.25-8.634c-8.54-7.875-9.252-8.682-8.73-9.63.285-.522 2.704-4.934 5.361-9.773 2.657-4.84 6.167-11.29 7.78-14.327 1.66-3.084 3.179-5.74 3.463-5.883.332-.19.427 4.602.332 14.802-.19 15.228-.142 15.275 1.376 14.943.19 0 .332-7.685.332-17.03V74.86l4.982-9.963c2.751-5.503 5.028-9.915 5.123-9.867.095.047.57 2.846 1.044 6.214zM20.228 3.842c-3.51 2.799-8.919 7.543-13.189 11.623l-3.368 3.178.617 4.175c.332 2.277.949 6.736 1.328 9.867.427 3.131.854 6.073.996 6.5.19.569 0 .854-.521.854-.902 0-.95-.238 1.518 7.59a514.06 514.06 0 001.85 6.025c.095.332.474.474.901.332.427-.19.664-.57.522-.901-.142-.38.095-.76.474-.902.522-.19.475-.569-.332-1.945-1.28-2.135-4.554-20.352-4.744-26.234-.142-4.175-.142-4.222 1.613-6.594 1.708-2.325 5.646-5.836 11.718-10.295 1.708-1.28 3.416-2.704 3.89-3.178.712-.854 1.044-.617 7.021 5.74 3.463 3.653 7.306 7.4 8.54 8.35l2.277 1.707-1.756 3.7c-.948 1.993-4.791 9.678-8.586 16.984-7.923 15.37-6.31 13.9-15.513 14.042l-5.978.048-1.992 2.277c-2.088 2.42-2.372 3.32-1.376 4.839.38.522.664 1.376.664 1.897 0 .854.332.997 2.23 1.092 1.186.047 2.277.19 2.42.332.142.142.331 3.083.474 6.546l.19 6.263-3.179 6.83c-5.266 11.387-7.353 16.605-7.353 18.313 0 .901.19 1.66.38 1.66.474 0 .474-.047 19.782-40.324 8.966-18.691 17.458-36.292 18.881-39.186 1.423-2.893 2.704-5.55 2.799-5.93.095-.427-3.178-3.7-8.397-8.302-4.696-4.174-8.824-7.97-9.203-8.397-1.091-1.328-2.704-.9-5.598 1.424zm-2.372 62.146c-.38.997-1.376 3.084-2.182 4.65-1.329 2.656-1.471 2.751-1.803 1.66-.19-.664-.332-2.61-.38-4.365-.047-3.463-.142-3.415 3.843-3.652l1.28-.048-.758 1.755zm3.985-7.59c-2.183 4.222-2.277 4.27-8.255 4.554-5.266.285-5.36.237-5.36-.759 0-.57-.19-1.328-.428-1.708-.284-.427-.094-1.186.57-2.23l1.043-1.612h4.744c2.61-.048 5.598-.238 6.642-.427 1.044-.19 1.945-.285 2.04-.238.095.048-.38 1.139-.996 2.42zm-.19-43.266c-.854.617-1.091 1.234-1.091 2.8 0 1.85.142 2.134 1.423 2.656 1.28.522 1.613.474 3.084-.522 1.945-1.328 1.992-1.66.569-3.795-1.233-1.85-2.467-2.182-3.985-1.139z"
        fillRule="nonzero"
      />
      <path d="M50.141 24.917c.352-.615 1.06-1.085 1.967-1.085.804 0 1.477.34 1.734.597.342.342.477.74.477 1.14 0 .089-.006.304-.119.612-.168.46-1.056 2.337-2.08 4.471-1.131 2.263-3.724 7.875-5.708 12.456-1.67 3.807-2.558 5.882-2.97 7.217-.301.975-.279 1.406-.123 2.031.558 2.33 1.27 7.705 1.122 8.731-.187 1.596 1.537 18.059 3.32 32.136 1.056 8.446 1.91 15.74 1.91 16.22l-.002.069c-.009.184-.087.608-.447 1.14-.506.748-1.932 2.415-3.805 4.477-4.242 4.671-10.806 11.46-13.673 14.058-.682.618-1.199 1.024-1.472 1.182a1.872 1.872 0 01-.612.237c-.41.077-1.225-.015-2.35-.738-1.495-.958-4.19-3.216-8.46-7.113-1.327-1.185-4.36-3.791-6.718-5.866-1.712-1.476-2.767-2.404-3.411-3.096-.677-.726-.994-1.29-1.16-1.838-.165-.544-.18-1.09-.117-1.847.104-1.1 1.103-3.738 2.466-6.15 1.182-2.08 5.247-9.833 9.031-17.26 3.34-6.491 5.06-9.853 5.906-11.859.677-1.603.696-2.113.587-2.93-.18-1.168-.195-1.884-.111-2.308.1-.511.321-.852.58-1.1.346-.331.813-.55 1.488-.55.199 0 .391.024.574.07 4.068-7.269 18.093-35.143 19.705-39.334.585-1.53 1.353-2.824 1.794-3.288.228-.24.462-.39.677-.482zM38.72 59.573a448.834 448.834 0 00-3.06 5.995l-4.823 9.646v16.63c0 8.501-.124 15.643-.287 16.987-.142 1.166-1.002 1.461-1.384 1.526l.16-.017c-.671.146-1.214.134-1.647-.048-.495-.208-1.058-.628-1.33-1.812-.332-1.439-.336-5.202-.22-14.563.04-4.272.047-7.59.016-9.984-.33.582-.666 1.188-.986 1.782-1.615 3.04-5.13 9.5-7.79 14.346-2.383 4.34-4.576 8.337-5.207 9.493.131.186.356.488.61.77 1.165 1.287 3.451 3.428 7.667 7.315l8.316 7.762.798-.63c1.917-1.497 7.518-7.35 12.808-13.296.898-.995 1.544-1.72 2-2.29.37-.464.594-.76.675-1.06.067-.247.004-.478-.051-.8l-.007-.041c-.475-3.324-2.184-16.382-3.657-28.168-.757-6.384-1.797-14.328-2.317-17.639l-.004-.023c-.089-.635-.185-1.272-.28-1.881zM19.289 2.67c1.673-1.343 3-2.097 4.04-2.364 1.537-.394 2.687.004 3.622 1.119.395.44 4.459 4.165 9.07 8.264 4.274 3.769 7.265 6.676 8.244 7.909.69.868.68 1.598.625 1.844a1.134 1.134 0 01-.009.038c-.1.398-1.416 3.195-2.908 6.228-1.423 2.893-9.912 20.488-18.875 39.173C7.581 97.252 4.465 103.75 3.6 105.058c-.497.75-.885.854-1.111.924a1.729 1.729 0 01-.526.075c-.42 0-.964-.148-1.368-.766-.223-.342-.511-1.288-.511-2.394 0-.606.19-1.593.67-3.031.955-2.865 3.1-7.863 6.821-15.91l3.03-6.513-.178-5.89a153.907 153.907 0 00-.33-5.346c-.352-.041-.773-.082-1.14-.096-.98-.05-1.616-.132-2.03-.262-.645-.203-1.016-.534-1.267-.927-.221-.348-.358-.79-.358-1.4 0-.282-.173-.735-.377-1.016l-.04-.06c-.621-.945-.859-1.756-.79-2.607.085-1.023.72-2.222 2.283-4.034l1.607-1.837c-.218-.687-.996-3.198-1.807-5.888-1.558-4.943-2.122-6.843-2.152-7.561-.034-.83.282-1.245.57-1.51a1.53 1.53 0 01.406-.265c-.216-1.235-.55-3.498-.875-5.878a488.89 488.89 0 00-1.323-9.83l-.617-4.174a1.5 1.5 0 01.455-1.31l3.361-3.172c4.301-4.11 9.749-8.888 13.287-11.709zm-3.879 71.31c-.31.282-.612.394-.858.441a1.547 1.547 0 01-1.04-.133l.103 3.419v.018l1.795-3.746zm12.426 1.473a23.55 23.55 0 01-.225.553 43.912 43.912 0 01-.762 1.686c.327-.11.65-.094.965.015l.022.008v-2.262zm1.524-3.996l-.032.037a1.575 1.575 0 01-.862.5c.042.411.057.798 0 1.25l.894-1.787zM16.286 65.87c-.566.056-1.034.116-1.267.149-.014.118-.03.274-.035.408-.012.4-.001.889.007 1.466.006.236.014.476.024.715.49-.996.97-2.019 1.271-2.738zm4.486-3.076a4.31 4.31 0 01-.88.653c.136.221.21.47.221.722l.28-.585.38-.79zm-.299-5.017c-1.381.167-3.98.323-6.29.365h-3.956l-.594.92c-.19.298-.36.7-.429.874.215.444.399 1.073.478 1.666h.014c.771.012 1.964-.048 3.819-.148 2.63-.125 3.979-.11 4.898-.616.326-.18.561-.453.817-.83.374-.551.75-1.277 1.243-2.231zm4.52-3.77a6.345 6.345 0 01-1.098.892c.156.141.3.333.383.595l.714-1.487zm15.241-3.122c-.47.933-.941 1.866-1.41 2.788.6-.263 1.192-.033 1.288.015.079.04.308.15.517.425a27.335 27.335 0 00-.224-1.044c-.185-.741-.289-1.336-.17-2.184zM24.148 5.38c-.758.673-2.198 1.856-3.649 2.944-5.896 4.33-9.738 7.716-11.4 9.978-.594.803-.97 1.278-1.177 1.801-.316.802-.217 1.685-.143 3.852.132 4.065 1.762 14.092 3.157 20.466.555 2.534 1.023 4.459 1.383 5.059.528.9.771 1.5.842 1.889.088.484.016.86-.118 1.167a1.86 1.86 0 01-.27.446l2.688-.021c1.824-.029 3.22.008 4.348-.039.897-.037 1.587-.11 2.187-.395.71-.336 1.26-.968 1.948-2.018 1.313-2.003 2.904-5.315 5.722-10.783 3.784-7.285 7.617-14.95 8.562-16.934l1.23-2.593-1.311-.984c-1.258-.967-5.182-4.782-8.717-8.51-2.604-2.769-4.52-4.608-5.282-5.325zm-11.86 47.18l-.001-.002-.026-.064.027.067zm-1.503-1.763l.059-.024a1.07 1.07 0 00-.059.024zm42.106-24.884l-.002.022.001-.009.001-.013zm.003-.035l.002-.071-.002.071zM20.773 13.917c-1.241.896-1.713 1.74-1.713 4.014 0 1.664.252 2.445.728 3.003.333.391.821.714 1.63 1.043.742.303 1.274.437 1.77.44.735.005 1.457-.254 2.72-1.109 1.495-1.02 2.072-1.825 2.19-2.615.111-.744-.188-1.715-1.214-3.254-.872-1.308-1.805-2.006-2.727-2.266-1.036-.292-2.15-.105-3.356.723l-.028.02zm4.263 4.285c-.128-.242-.375-.69-.648-1.099-.4-.599-.69-1.03-1.123-1.056-.24-.015-.473.122-.744.308-.461.337-.461.721-.461 1.576 0 .418.04.884.058 1.065.1.052.282.142.431.203.283.115.47.216.66.218.084 0 .152-.057.255-.113.215-.115.46-.275.757-.476.311-.213.632-.472.815-.626zM19.293 2.669l-.005.003.005-.003z" />
    </svg>
  );
};

export default ExcalidrawIcon;