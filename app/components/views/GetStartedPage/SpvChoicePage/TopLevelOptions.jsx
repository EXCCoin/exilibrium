import { FormattedMessage as T } from "react-intl";
import { ExternalLink } from "shared";
import PrivacyOption from "../PrivacyPage/PrivacyOption";
import PrivacyOptions from "../PrivacyPage/PrivacyOptions";
import { Title, SubTitle } from "../helpers";

export default ({ toggleSpv }) => (
  <>
    <Title>
      <T id="spv.title" m={"Simple Payment Verification (SPV)"} />
    </Title>
    <SubTitle>
      <T
        id="spv.titleSub"
        m={
          "Select how Exilibrium should connect to the ExchangeCoin network. You can change this in the application settings later. For more in-depth information about SPV and how it works, you can go {link}"
        }
        values={{
          link: (
            <ExternalLink href={"https://docs.excc.co/wallets/spv/"}>
              <T id="spv.titleSub.here" m="here" />
            </ExternalLink>
          )
        }}
      />
    </SubTitle>
    <PrivacyOptions>
      <PrivacyOption
        title={<T id="spv.options.enable.title" m="Enable SPV" />}
        icon="spvOn"
        description={
          <T
            id="spv.options.enable.description"
            m="SPV will allow your wallets to be restored and used much more quickly.  This speed comes at cost, with blocks not being fully verified.  It's 'less secure' but very unlikely that there will be any problems."
          />
        }
        onClick={() => toggleSpv(true)}
      />
      <PrivacyOption
        title={<T id="spv.options.disable.title" m="Disable SPV" />}
        icon="spvOff"
        description={
          <T
            id="spv.options.disable.description"
            m="This will use the regular ExchangeCoin daemon and fully verify blocks.  This will take longer but is fully secure.  Any block or mined transaction can be fully trusted."
          />
        }
        onClick={() => toggleSpv(false)}
      />
    </PrivacyOptions>
  </>
);
