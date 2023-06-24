import React from "react";
import useDeviceDimensions from "../hooks/useDeviceDimensions";

const LandingFeature = ({
  feature,
  featureIndex,
  handleChangeActive,
  isLast,
}: any) => {
  const { title, subFeatures, activeSubFeatureIndex, subFeatureImages } =
    feature;

  const { isTabletOrMobile } = useDeviceDimensions();
  const isOdd = featureIndex % 2 !== 0;
  const activeImagePath = subFeatureImages[activeSubFeatureIndex];

  return (
    <div
      className={`max-w-[1300px] w-5/6 min-w-11/12 my-10 mx-auto py-4 relative `}
    >
      <img
        src="/feature-arrow.svg"
        className="absolute left-0 -bottom-24 w-1/2 md:hidden"
      />
      <h1 className="mx-auto mb-10 text-2xl font-normal text-center text-gray-900 max-w-11/12 md:w-[32rem] ">
        {title}
      </h1>
      <div className="flex flex-col items-center justify-center md:flex-row">
        <div className="flex flex-col items-center justify-center w-full mx-10 md:hidden">
          {subFeatures.map((subFeature: any, index: number) => {
            const { title, subText } = subFeature;
            const imgPath = subFeatureImages[index];
            return (
              <div
                className="flex relative flex-col items-center w-full justify-center py-3 "
                key={title}
              >
                <div
                  className={`absolute  ${
                    subFeatures.length - 1 === index
                      ? "h-[97%] sm:h-[87%]"
                      : "h-full"
                  } left-0 w-[2px]  bg-[url('/dashed-line.svg')] bg-cover bg-center top-[42px]`}
                />
                <div className="rounded-full absolute top-[42px] blur-[1px] left-[1px] bg-blue-500 border-blue-500 w-2.5 h-2.5 -translate-x-1/2 " />
                <div className="text-left w-11/12 my-2 ">
                  <h3 className="my-3 font-semibold text-lg text-gray-800">
                    {title}
                  </h3>
                  <p className="my-3 text-gray-600 text-base">{subText}</p>
                </div>
                <div
                  className={`bg-gray-100 rounded-lg w-11/12  flex items-center justify-center object-contain rounded`}
                >
                  <img
                    src={`/LandingFeatures/${imgPath}`}
                    className="w-full duration-300 ease-in rounded max-h-11/12"
                    alt={title}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="hidden md:flex  flex-col items-center justify-center w-full mx-10 md:w-2/5">
          {subFeatures.map((subFeature: any, index: number) => {
            const { title, subText } = subFeature;
            const isActive = index === activeSubFeatureIndex;

            return (
              <div
                className={`p-5 ease-in duration-150 shadow-lg my-4 w-11/12 rounded-lg cursor-pointer ${
                  isActive
                    ? `${
                        isOdd || isTabletOrMobile
                          ? "border-r-4 "
                          : "border-l-4 "
                      }border-blue-400`
                    : "opacity-50"
                }`}
                key={title}
                onClick={() => handleChangeActive(index)}
              >
                <h3 className="my-3 font-semibold text-gray-800">{title}</h3>
                <p className="my-3 text-gray-600 text-sm">{subText}</p>
              </div>
            );
          })}
        </div>
        <div
          className={`bg-#ECEFF1 md:h-[450px] rounded-lg w-11/12 md:w-3/5  items-center justify-center hidden md:flex   ${
            isOdd ? "order-first" : ""
          }`}
        >
          <div
          className="bg-gray-100 md:h-[433px] rounded-lg w-11/12 items-center justify-center flex"
          >
          <img
            src={`/LandingFeatures/${activeImagePath}`}
            className="duration-300 ease-in"
            alt={title}
          />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingFeature;
