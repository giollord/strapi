import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Card, CardAsset, CardBody, CardContent, CardHeader, CardSubtitle, CardTitle } from '@strapi/design-system';
import styled from 'styled-components';
import { EmptyPictures } from '@strapi/icons/symbols';

interface SortableItemProps {
  id: string;
  title: string;
  subtitle: string;
  thumbnailUri: string;
  resizable: boolean;
}

const StyledEmptyPictures = styled(EmptyPictures)`
  margin: 0;
  padding: 0;
  width: auto;
  height: auto;
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
`;

const ResizableCard = styled(Card)`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ResizableCardHeader = styled(CardHeader)`
  overflow: hidden;
  flex: 1;
  
  div {
    width: 100%;
    height: 100%;
  }
`;

export const SortableItem = (props: SortableItemProps) => {
  const sortable = useSortable({ id: props.id });
  const { setNodeRef, isDragging, listeners, attributes, transition, transform } = sortable

  const transitionStr = [transition || (!isDragging && 'transform 0.2s ease')].concat('opacity 0.5s ease').filter(x=>x).join(', ');

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transitionStr,
    zIndex: isDragging ? 100 : undefined,
    opacity: isDragging ? 0.75 : 1,
    width: '100%',
  };

  if(props.resizable) {
    return (
      <ResizableCard ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <ResizableCardHeader>
          {props.thumbnailUri &&
            <CardAsset src={props.thumbnailUri} />}
          {!props.thumbnailUri &&
            <CardAsset>
              <StyledEmptyPictures style={{ objectFit: "contain", width: '100%' }} />
            </CardAsset>}
        </ResizableCardHeader>
        {(props.title || props.subtitle) && (
          <CardBody>
            <CardContent>
              {props.title && <CardTitle>{props.title}</CardTitle>}
              {props.subtitle && <CardSubtitle>{props.subtitle}</CardSubtitle>}
            </CardContent>
          </CardBody>
        )}
      </ResizableCard>);
  }
  return (
    <Card ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CardHeader>
        {props.thumbnailUri &&
          <CardAsset src={props.thumbnailUri} />}
        {!props.thumbnailUri &&
          <CardAsset>
            <StyledEmptyPictures style={{ objectFit: "contain", width: '100%' }} />
          </CardAsset>}
      </CardHeader>
      {(props.title || props.subtitle) && (
        <CardBody>
          <CardContent>
            {props.title && <CardTitle>{props.title}</CardTitle>}
            {props.subtitle && <CardSubtitle>{props.subtitle}</CardSubtitle>}
          </CardContent>
        </CardBody>
      )}
    </Card>
  );
}
