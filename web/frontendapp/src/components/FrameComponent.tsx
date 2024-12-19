import { FunctionComponent } from "react";

export type FrameComponentType = {
  className?: string;
};

const FrameComponent: FunctionComponent<FrameComponentType> = ({
  className = "",
}) => {
  return (
    <section
      className={`self-stretch flex flex-col items-start justify-start gap-2 max-w-full text-left text-lg text-white font-montserrat ${className}`}
    >
      <div className="w-[939px] flex flex-row items-start justify-between gap-5 max-w-full mq750:flex-wrap">
        <div className="w-[209px] relative tracking-[-0.4px] leading-[20px] font-semibold inline-block shrink-0 z-[1]">
          10.5% DUNA Treasury
        </div>
        <div className="w-[179px] relative tracking-[-0.4px] leading-[20px] font-semibold inline-block shrink-0 z-[1]">
          20% Team
        </div>
      </div>
      <div className="self-stretch flex flex-row items-start justify-start flex-wrap content-start gap-[117px] max-w-full text-base text-gray-200 lg:gap-[58px] mq750:gap-[29px]">
        <div className="w-[218px] flex flex-col items-start justify-start gap-[280px]">
          <div className="relative tracking-[-0.4px] leading-[20px] font-medium z-[1]">
            This is the treasury that is managed by the Common Ground
            Association
          </div>
          <div className="self-stretch flex flex-col items-start justify-start gap-2 text-lg text-white">
            <div className="w-[209px] relative tracking-[-0.4px] leading-[20px] font-semibold inline-block z-[1]">
              51% Community Fund
            </div>
            <div className="relative text-base tracking-[-0.4px] leading-[20px] font-medium text-gray-200 z-[1]">
              This can only be earned by being a good citizen, earning rewards
              on the app
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-row items-start justify-start gap-10 min-w-[522px] max-w-full text-17xl text-white lg:min-w-full mq450:gap-5 mq1050:flex-wrap">
          <div className="flex-1 flex flex-col items-start justify-start pt-5 px-0 pb-0 box-border min-w-[251px] max-w-full">
            <div className="self-stretch flex flex-row items-start justify-start py-[169px] pl-[134px] pr-[131px] relative mq450:py-[110px] mq450:px-5 mq450:box-border">
              <img
                className="h-full w-full absolute !m-[0] top-[0px] right-[0px] bottom-[0px] left-[0px] max-w-full overflow-hidden max-h-full object-cover z-[1]"
                alt=""
                src="/chart@2x.png"
              />
              <img
                className="h-[98px] w-[126px] absolute !m-[0] top-[-37px] right-[-29px] z-[2]"
                loading="lazy"
                alt=""
                src="/vector-8.svg"
              />
              <img
                className="h-[51px] w-[202px] absolute !m-[0] bottom-[57px] left-[-127px] object-contain z-[2]"
                alt=""
                src="/vector-12.svg"
              />
              <img
                className="h-[89px] w-[272px] absolute !m-[0] top-[-37px] left-[-134px] object-contain z-[2]"
                alt=""
                src="/vector-13.svg"
              />
              <h1 className="m-0 relative text-inherit tracking-[-1px] leading-[48px] font-bold font-[inherit] inline-block min-w-[121px] z-[2] mq450:text-3xl mq450:leading-[29px] mq1050:text-10xl mq1050:leading-[38px]">
                $BEZY
              </h1>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-start justify-start gap-6 min-w-[245px] max-w-full text-lg">
            <div className="w-48 relative text-base tracking-[-0.4px] leading-[20px] font-medium text-gray-200 inline-block z-[1]">
              Founders, staff and future hires of the BEZY development team
            </div>
            <div className="self-stretch flex flex-row items-start justify-end py-0 px-[63px] relative mq450:pl-5 mq450:pr-5 mq450:box-border">
              <div className="w-[178px] flex flex-col items-start justify-start gap-2">
                <div className="self-stretch relative tracking-[-0.4px] leading-[20px] font-semibold z-[1]">
                  1% Airdrop
                </div>
                <div className="relative text-base tracking-[-0.4px] leading-[20px] font-medium text-gray-200 z-[1]">
                  Reward for early users
                </div>
              </div>
              <img
                className="h-[34px] w-[212px] absolute !m-[0] bottom-[3px] left-[-84px] z-[2]"
                loading="lazy"
                alt=""
                src="/vector-9.svg"
              />
            </div>
            <div className="self-stretch flex flex-row items-start justify-end py-0 px-[31px] relative">
              <div className="w-[178px] flex flex-col items-start justify-start gap-2">
                <div className="relative tracking-[-0.4px] leading-[20px] font-semibold z-[1]">
                  7% Angel Investors
                </div>
                <div className="relative text-base tracking-[-0.4px] leading-[20px] font-medium text-gray-200 z-[1]">
                  The backers that have brought us to where we are today
                </div>
              </div>
              <img
                className="h-[11px] w-[231px] absolute !m-[0] top-[11px] left-[-79px] z-[2]"
                loading="lazy"
                alt=""
                src="/vector-10.svg"
              />
            </div>
            <div className="self-stretch flex flex-row items-start justify-end relative">
              <div className="w-[241px] flex flex-col items-start justify-start gap-2">
                <div className="self-stretch relative tracking-[-0.4px] leading-[20px] font-semibold z-[1]">
                  10.5% Public Token Sale
                </div>
                <div className="relative text-base tracking-[-0.4px] leading-[20px] font-medium text-gray-200 z-[1]">
                  Your opportunity to own a big piece of the $BEZY token
                </div>
              </div>
              <img
                className="h-3 w-52 absolute !m-[0] top-[-4px] left-[-93px] z-[2]"
                loading="lazy"
                alt=""
                src="/vector-11.svg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FrameComponent;
